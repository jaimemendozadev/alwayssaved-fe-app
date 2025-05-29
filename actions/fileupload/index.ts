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

/*************************************************
 * handleNoteDeletion
 **************************************************/

export const handleFileDeletion = async (
  fileDBResults: LeanFile[]
): Promise<void> => {
  await Promise.allSettled(
    fileDBResults.map(async (file) => {
      await dbConnect();

      const _id = getObjectIDFromString(file._id);

      return FileModel.findOneAndDelete({ _id }).exec();
    })
  );
};

/***************************************************/

/*************************************************
 * handleNoteDeletion
 **************************************************/

export const handleNoteDeletion = async (
  newNote: LeanNote
): Promise<LeanNote> => {
  await dbConnect();

  const _id = getObjectIDFromString(newNote._id);

  const deletedNote = await NoteModel.findOneAndDelete({ _id }).exec();

  return deepLean(deletedNote);
};

/***************************************************/

/*************************************************
 * handleFileDocUpdate
 **************************************************/

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

/***************************************************/

/***************************************************/

/*************************************************
 * createNoteFileDocs
 **************************************************/

export interface noteFileResult {
  newNote: LeanNote[];
  fileDBResults: LeanFile[];
}

interface filePayload {
  name: string;
  type: string;
}

interface createNoteFileDocsArguments {
  filePayloads: filePayload[];
  currentUserID: string;
  noteTitle: string;
}

export const createNoteFileDocs = async ({
  filePayloads,
  currentUserID,
  noteTitle
}: createNoteFileDocsArguments): Promise<noteFileResult> => {
  try {
    await dbConnect();

    // 1) Create a single MongoDB Note document.
    const userMongoID = getObjectIDFromString(currentUserID);

    const notePayload = {
      user_id: userMongoID,
      title: noteTitle
    };

    const [createdNote] = await NoteModel.create([notePayload], { j: true });

    if (!createdNote) {
      throw new Error(
        `There was a problem creating a Note document for user ${currentUserID} in createNoteFileDocs.`
      );
    }

    const noteMongoID = createdNote._id;

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

    const newNote = [deepLean(createdNote)];

    // 3) Filter out and sanitize fulfilled results.
    const filteredResults = fileDBResults.filter(
      (result) => result.status === 'fulfilled'
    );

    const finalizedResults = filteredResults.map((result) =>
      deepLean(result.value)
    );

    return {
      newNote,
      fileDBResults: finalizedResults
    };
  } catch (error) {
    //TODO: Handle in telemetry.
    console.log('Error in createNoteFileDocs ', error);
  }

  return {
    newNote: [],
    fileDBResults: []
  };
};

/***************************************************/

/********************************************
 * Notes
 ********************************************


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
