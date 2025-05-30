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

import { s3UploadResult } from '@/components/fileupload/utils';

/*************************************************
 * handleNoteDeletion
 **************************************************/

export const handleFileDeletion = async (
  fileDBIDs: string[]
): Promise<void> => {
  try {
    await dbConnect();

    await Promise.allSettled(
      fileDBIDs.map(async (fileStringID) => {
        const _id = getObjectIDFromString(fileStringID);

        return FileModel.findOneAndDelete({ _id }).exec();
      })
    );
  } catch (error) {
    // TODO: Handle in telemetry.
    console.log('Error in handleFileDeletion: ', error);
  }
};

/***************************************************/

/*************************************************
 * handleNoteDeletion
 **************************************************/

export const handleNoteDeletion = async (newNote: LeanNote): Promise<void> => {
  const _id = getObjectIDFromString(newNote._id);

  try {
    await dbConnect();

    await NoteModel.findOneAndDelete({ _id }).exec();
  } catch (error) {
    // TODO: Handle in telemetry.
    console.log(
      `Error in handleNoteDeletion for Note with ID of ${_id}:`,
      error
    );
  }
};

/***************************************************/

/*************************************************
 * handleFileDocUpdate
 **************************************************/

interface UpdateStatus {
  file_id: string;
  update_status: string;
}

export const handleFileDocUpdate = async (
  fileUpdates: s3UploadResult[]
): Promise<UpdateStatus[]> => {
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

/*************************************************
 * createNoteFileDocs
 **************************************************/

export interface noteFileResult {
  newNote: LeanNote[];
  fileDBResults: LeanFile[];
}

interface createNoteFileDocsArguments<T extends File> {
  currentFiles: T[];
  currentUserID: string;
  noteTitle: string;
}

export const createNoteFileDocs = async <T extends File>({
  currentFiles,
  currentUserID,
  noteTitle
}: createNoteFileDocsArguments<T>): Promise<noteFileResult> => {
  try {
    await dbConnect();

    const filePayloads = currentFiles.map((file) => ({
      name: file.name,
      type: file.type
    }));

    console.log('filePayloads ', filePayloads);

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
