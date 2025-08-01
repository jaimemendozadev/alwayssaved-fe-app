import { presignPayload } from '@/actions/fileupload/handlePresignedUrls';
import { BackendResponse } from '@/utils/ts';

export interface ProcessStatus {
  s3_key: string;
  process_status: 'success' | 'failure';
}

// See Dev Notes below.
export const processFile = async <T extends File>(
  file: T,
  targetPayload: presignPayload
): Promise<ProcessStatus> => {
  const controller = new AbortController();

  const { presigned_url, file_id, s3_key, note_id, user_id } = targetPayload;

  const processStatus: ProcessStatus = {
    s3_key,
    process_status: 'failure'
  };

  const s3DeleteURL = `/api/s3/${s3_key}`;
  const fileDeleteURL = `/api/files/${file_id}`;

  // TODO: Refactor and use makeBackEndRequest

  try {
    // 1) Upload file to s3.
    const s3UploadRes = await fetch(presigned_url, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
      signal: controller.signal
    });

    if (s3UploadRes.status !== 200) {
      throw new Error(
        `There was an error uploading the file with the s3_key of ${s3_key} to s3.`
      );
    }

    // 2) Make /api request to update File document s3_key property.
    const updateResponse: BackendResponse<unknown> = await fetch('/api/files', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id, update: { s3_key } })
    });

    if (updateResponse.status !== 200) {
      await fetch(s3DeleteURL, {
        method: 'DELETE'
      });

      await fetch(fileDeleteURL, {
        method: 'DELETE'
      });

      throw new Error(
        `There was a problem updating the file ${file_id} with s3_key ${s3_key} in the database.`
      );
    }

    // 3) Send SQS Message in Backend.
    const sqsResponse: BackendResponse<unknown> = await fetch(
      '/api/extractorqueue',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_id, user_id, s3_key })
      }
    );


    if (sqsResponse.status !== 200) {
      await fetch(s3DeleteURL, {
        method: 'DELETE'
      });

      await fetch(fileDeleteURL, {
        method: 'DELETE'
      });

      throw new Error(
        `There was a problem sending a message to the Extractor Queue for user ${user_id} with s3_key ${s3_key}.`
      );
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    throw new Error(
      `Error in UploadManager.uploadFile uploading file with s3_key: ${s3_key}: ${message}`
    );
  }

  processStatus['process_status'] = 'success';

  return processStatus;
};

/********************************************
 * Notes
 ********************************************

 1) Media assets are stored in s3 in the following s3 Key format: 

    /{fileOwner}/{noteID}/{fileID}/{fileName}.{fileExtension} 

    fileOwner: is the User._id
    fileName: is the name of the file with the fileType extension 


2) processFile has 3 steps where we:
      - Upload the file to s3;
      - Update the File document with the uploaded s3_key; and
      - Send a Message to the SQS Extractor Queue.

    If the upload to s3 fails we return early, or if either the db
    update or sending the SQS message fails, we delete the uploaded
    s3 file and the file document in the db. In v1, it's an all or
    nothing operation and we don't want dangling files in s3 or
    in the database.
*/
