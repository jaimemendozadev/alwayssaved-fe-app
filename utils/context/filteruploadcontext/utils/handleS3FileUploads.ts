import { presignPayload } from '@/actions/fileuploadcontext/handlePresignedUrls';

export interface s3UploadResult {
  file_id: string;
  update: {
    s3_key: string;
  };
}

export const handleS3FileUploads = async <T extends File>(
  currentFiles: T[],
  presignPayloads: presignPayload[]
): Promise<s3UploadResult[]> => {
  const uploadResults = await Promise.allSettled(
    currentFiles.map(async (file) => {
      const targetName = file.name;
      const targetType = file.type;

      const [targetPayload] = presignPayloads.filter(
        (s3Payload) => s3Payload.file_name === targetName
      );

      const { presigned_url, file_id, s3_key } = targetPayload;

      try {
        await fetch(presigned_url, {
          method: 'PUT',
          headers: { 'Content-Type': targetType },
          body: file
        });

        return {
          file_id,
          update: { s3_key }
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        throw new Error(
          `Error in handleS3FileUploads for s3_key: ${s3_key}: ${message}`
        );
      }
    })
  );

  console.log('uploadResults in handleS3FileUploads ', uploadResults);

  // Log s3FileUpload Failures
  uploadResults.forEach((result) => {
    if (result.status === 'rejected') {
      // TODO: Handle in telemetry.
      console.error('Uploading file to s3 failed: ', result.reason);
    }
  });

  const filteredUploadResults = uploadResults.filter(
    (result) => result.status === 'fulfilled'
  );

  const finalizedUploadResults = filteredUploadResults.map(
    (result) => result.value
  );

  return finalizedUploadResults;
};