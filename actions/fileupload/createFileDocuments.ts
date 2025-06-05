'use server';
import {
  dbConnect,
  getObjectIDFromString,
  FileModel,
  deepLean,
  LeanFile
} from '@/utils/mongodb';

export interface fileInfo {
  name: string;
  type: string;
}

export const createFileDocuments = async (
  fileInfoArray: fileInfo[],
  currentUserID: string,
  noteID: string
): Promise<LeanFile[]> => {
  try {
    await dbConnect();

    if (!currentUserID || !noteID || fileInfoArray.length === 0) {
      throw new Error(
        `createFileDocuments has missing currentUserID: ${currentUserID}, noteID: ${noteID}, or fileInfoArray has ${fileInfoArray.length} files. Cannot continue uploading.`
      );
    }

    const userMongoID = getObjectIDFromString(currentUserID);

    const noteMongoID = getObjectIDFromString(noteID);

    const fileDBResults = await Promise.allSettled(
      fileInfoArray.map(async (file) => {
        const file_name = file.name;
        const file_type = file.type;

        try {
          const filePayload = {
            user_id: userMongoID,
            note_id: noteMongoID,
            file_name,
            file_type
          };

          const [createdFile] = await FileModel.create([filePayload], {
            j: true
          });

          return createdFile;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);

          throw new Error(
            `Error in createFileDocuments for user_id ${currentUserID}, note_id ${noteID}, for file_name ${file_name}: ${message}`
          );
        }
      })
    );

    console.log('fileDBResults ', fileDBResults);

    // Log File document creation failures
    fileDBResults.forEach((result) => {
      if (result.status === 'rejected') {
        // TODO: Handle in telemetry.
        console.error('File document creation failed:', result.reason);
      }
    });

    // 3) Filter out and sanitize fulfilled results.
    const filteredResults = fileDBResults.filter(
      (result) => result.status === 'fulfilled'
    );

    const finalizedResults = filteredResults.map((result) =>
      deepLean(result.value)
    );

    return finalizedResults;
  } catch (error) {
    //TODO: Handle in telemetry.
    console.log('Error in createNoteFileDocs ', error);
  }

  return [];
};
