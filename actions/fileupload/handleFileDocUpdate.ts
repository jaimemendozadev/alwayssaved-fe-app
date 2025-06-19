'use server';
import { dbConnect, FileModel, getObjectIDFromString } from '@/utils/mongodb';
import { s3UploadResult } from '@/components/fileupload/utils/handleS3FileUploads';


interface UpdateStatus {
  file_id: string;
  update_status: string;
}

export const handleFileDocUpdate = async (
  fileUpdates: s3UploadResult[]
): Promise<UpdateStatus[]> => {
  let updateResults: PromiseSettledResult<{
    file_id: string;
    update_status: string;
  }>[] = [];

  try {
    await dbConnect();

    updateResults = await Promise.allSettled(
      fileUpdates.map(async (updateInfo) => {
        const { file_id, update } = updateInfo;

        try {
          await dbConnect();

          const targetID = getObjectIDFromString(file_id);

          const updatedFile = await FileModel.findByIdAndUpdate(
            targetID,
            update,
            {
              new: true
            }
          ).exec();

          console.log('updatedFile ', updatedFile);

          return {
            file_id,
            update_status: 'success'
          };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);

          throw new Error(
            `Error in handleFileDocUpdate for file_id ${file_id}: ${message}`
          );
        }
      })
    );
  } catch (error) {
    console.log('Error top level of try of handleFileDocUpdate: ', error);
  }

  // Log File Deletion Failures
  updateResults.forEach((result) => {
    if (result.status === 'rejected') {
      // TODO: Handle in telemetry.
      console.error('File document update failed:', result.reason);
    }
  });

  const filteredResults = updateResults.filter(
    (result) => result.status === 'fulfilled'
  );

  const finalizedResults = filteredResults.map((result) => result.value);

  return finalizedResults;
};
