'use server';
import { dbConnect, INote, LeanFile, LeanNote } from '@/utils/mongodb';
import { LeanUser, NoteModel, FileModel, deepLean, getObjectIDFromString } from '@/utils/mongodb';
import { createPresignedUrlWithClient } from '@/utils/aws/s3';

interface s3FileUploadArguments {
  payload: {
    fileName: string;
    fileOwner: string;
  };
}

// See Note #2 below
export async function s3FileUpload({ payload }: s3FileUploadArguments) {
  /* TODOs:

     [ ]: Create a MongoDB Note.
     [ ]: Create a MongoDB File.
     [ ]: Create an s3 Presigned Url for file.
    */

  /*
    Proposed s3 Key: 
    /{fileOwner}/{noteID}/{fileID}/{fileName}.{fileExtension}   
  */

  try {
    const { fileName, fileOwner } = payload;

    const key = `${fileOwner}/${noteID}/${fileID}/${fileName}`; // See Note #3 below

    const presignedUrl = await createPresignedUrlWithClient(key);
  } catch (error) {
    // TODO: Handle error in telemetry
    console.log('There was a problem s3FileUpload: ', error);
  }
}


/* eslint-disable @typescript-eslint/no-explicit-any */
interface createNoteFileDocsProps {
  filePayloads: {[key: string]: any}[];  
  currentUser: LeanUser;
  noteName: string;
}

export const createNoteFileDocs = async ({filePayloads, currentUser, noteName}: createNoteFileDocsProps

): Promise<{newNote: LeanNote[], fileDBResults: LeanFile[]}> => {

  await dbConnect();

  // 1) Create a single MongoDB Note document.
  const userStringID = currentUser._id;
  const userMongoID = getObjectIDFromString(userStringID);

  const notePayload = {
    user_id: userMongoID,
    title: noteName
  };

  const [newNote] = await NoteModel.create([notePayload], { j: true });

  console.log("newNote ", newNote);
  console.log("\n");

  const noteMongoID = newNote._id;


  // 2) Create File documents for each filePayload.
  const fileDBResults = await Promise.allSettled(
    filePayloads.map((file) => {
      const filePayload = {
        user_id: userMongoID,
        note_id: noteMongoID,
        file_name: file.name,
        file_type: file.type
      };

      return FileModel.create([filePayload], { j: true });
    })
  );

  console.log('fileDBResults ', fileDBResults);

  const sanitizedNote = deepLean(newNote);

  const sanitizedResults = fileDBResults.filter(result => result.status === 'fulfilled')

  const finalizedResults = sanitizedResults.map(result => deepLean(result.value));

  return {
    newNote: [sanitizedNote],
    fileDBResults: finalizedResults
  }
};

/********************************************
 * Notes
 ********************************************



 2) If the presignedURL was created in the POST request, the PUT 
    request will update the RecipeAssets with the new URL. 

 3) Media assets are stored in s3 in the following s3 Key format: 

    /{fileOwner}/{noteID}/{fileID}/{fileName}.{fileExtension} 

    fileOwner: is the User._id
    fileName: is the name of the file with the fileType extension 



 From Extractor Service Dev Notes 5/10/25 (Extractor Notes need to be updated):

- Decided to organize media uploads and call each upload a "Note".
- If the Note is an .mp3 or .mp4, a Note is created for that file and it'll get uploaded on the Frontend to s3 at /{userID}/{noteID}/{fileName}.{fileExtension}
- When SQS messages arrives in Extractor service, will transcribe and upload the transcript to s3 at /{userID}/{noteID}/{fileName}.txt
- Incoming SQS Message has the following shape:
  {
     note_id: ObjectID;
     user_id: ObjectID;
     s3_key: string;
  }   

*/