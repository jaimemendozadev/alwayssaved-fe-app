'use server';
import { LeanFile } from '@/utils/mongodb';

import { handlePresignedUrlsWithClient } from '@/utils/aws';

export interface presignPayload {
  s3_key: string;
  note_id: string;
  user_id: string;
  file_id: string;
  file_name: string;
  presigned_url: string;
}

export const handlePresignedUrls = async (
  fileDocuments: LeanFile[]
): Promise<presignPayload[]> => {
  const presignResults = await Promise.allSettled(
    fileDocuments.map(async (fileDoc) => {
      const { file_name, note_id, user_id, _id } = fileDoc;

      const noteID = typeof note_id === 'string' ? note_id : note_id._id;
      const userID = typeof user_id === 'string' ? user_id : user_id._id;

      const s3_key = `${userID}/${noteID}/${_id}/${file_name}`;

      try {
        const presigned_url = await handlePresignedUrlsWithClient(s3_key);

        return {
          s3_key,
          note_id: noteID,
          user_id: userID,
          file_id: _id,
          file_name,
          presigned_url
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        throw new Error(
          `Error in handlePresignedUrls for s3_key: ${s3_key}: ${message}`
        );
      }
    })
  );

  // Log preSignUrl Failures
  presignResults.forEach((result) => {
    if (result.status === 'rejected') {
      // TODO: Handle in telemetry.
      console.error('Creating PresignUrl failed: ', result.reason);
    }
  });

  const filteredResults = presignResults.filter(
    (result) => result.status === 'fulfilled'
  );

  const finalizedResults = filteredResults.map((result) => result.value);

  return finalizedResults;
};
