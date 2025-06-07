'use server';
import {
  dbConnect,
  FileModel,
  getObjectIDFromString
} from '@/utils/mongodb';


export const handleFileDeletion = async (
  fileDBIDs: string[]
): Promise<void> => {
  try {
    await dbConnect();

    const deletionResults = await Promise.allSettled(
      fileDBIDs.map(async (fileStringID) => {
        try {
          const _id = getObjectIDFromString(fileStringID);

          return FileModel.findOneAndDelete({ _id }).exec();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);

          throw new Error(`Error in handleFileDeletion: ${message}`);
        }
      })
    );

    // Log File Deletion Failures
    deletionResults.forEach((result) => {
      if (result.status === 'rejected') {
        // TODO: Handle in telemetry.
        console.error('Deletion failed:', result.reason);
      }
    });
  } catch (error) {
    // TODO: Handle in telemetry.
    console.log('Error in handleFileDeletion: ', error);
  }
};