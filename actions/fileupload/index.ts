'use server';
import {
  dbConnect,
  LeanFile,
  LeanNote,
  NoteModel,
  FileModel,
  deepLean,
  getObjectIDFromString
} from '@/utils/mongodb';
import { createPresignedUrlWithClient } from '@/utils/aws/s3';

interface UpdateStatus {
  file_id: string;
  update_status: string;
}

interface fileUpdate {
  file_id: string;
  update: { s3_key: string };
}
interface handleFileDocUpdateArguments {
  fileUpdates: fileUpdate[];
}

export const handleFileDocUpdate = async ({
  fileUpdates
}: handleFileDocUpdateArguments): Promise<UpdateStatus[]> => {
  const updateResults = await Promise.allSettled(
    fileUpdates.map(async (updateInfo) => {
      const { file_id, update } = updateInfo;

      const targetID = getObjectIDFromString(file_id);

      const updatedFile = await FileModel.findByIdAndUpdate(targetID, update, {
        new: true
      }).exec();

      console.log('updatedFile ', updatedFile);

      return {
        file_id,
        update_status: 'success'
      };
    })
  );

  const filteredResults = updateResults.filter(
    (result) => result.status === 'fulfilled'
  );

  const finalizedResults = filteredResults.map((result) => result.value);

  return finalizedResults;
};

interface createPresignedUrlArguments {
  fileDocuments: LeanFile[];
}
interface s3FilePayload {
  s3_key: string;
  file_id: string;
  file_name: string;
  presigned_url: string;
}

// See Note #1 below.
export const createPresignedUrl = async ({
  fileDocuments
}: createPresignedUrlArguments): Promise<s3FilePayload[]> => {
  const presignResults = await Promise.allSettled(
    fileDocuments.map(async (fileDoc) => {
      const { file_name, note_id, user_id, _id } = fileDoc;

      const s3_key = `${user_id}/${note_id}/${_id}/${file_name}`;

      const presignedURL = await createPresignedUrlWithClient(s3_key);

      return {
        s3_key,
        file_id: _id,
        file_name,
        presigned_url: presignedURL
      };
    })
  );

  const filteredResults = presignResults.filter(
    (result) => result.status === 'fulfilled'
  );

  const finalizedResults = filteredResults.map((result) => result.value);

  return finalizedResults;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
interface createNoteFileDocsArguments {
  filePayloads: { [key: string]: any }[];
  currentUserID: string;
  noteName: string;
}

export const createNoteFileDocs = async ({
  filePayloads,
  currentUserID,
  noteName
}: createNoteFileDocsArguments): Promise<{
  newNote: LeanNote[];
  fileDBResults: LeanFile[];
}> => {
  await dbConnect();

  // 1) Create a single MongoDB Note document.
  const userMongoID = getObjectIDFromString(currentUserID);

  const notePayload = {
    user_id: userMongoID,
    title: noteName
  };

  const [newNote] = await NoteModel.create([notePayload], { j: true });

  console.log('newNote ', newNote);
  console.log('\n');

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

  // 3) Filter out and sanitize fulfilled results.
  const filteredResults = fileDBResults.filter(
    (result) => result.status === 'fulfilled'
  );

  const finalizedResults = filteredResults.map((result) =>
    deepLean(result.value)
  );

  return {
    newNote: [sanitizedNote],
    fileDBResults: finalizedResults
  };
};

/********************************************
 * Notes
 ********************************************

 1) Media assets are stored in s3 in the following s3 Key format: 

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
