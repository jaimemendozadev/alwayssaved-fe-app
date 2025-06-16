import { presignPayload } from '@/actions/fileuploadcontext/handlePresignedUrls';
import { BackendResponse } from '@/utils/ts';

import {
  handleFileDeletion,
  handleNoteDeletion
} from '@/actions/fileuploadcontext';

/*

await handleFileDeletion(fileIDs);

    await handleNoteDeletion(newNote);

 */
class UploadManager {
  uploads = new Map();

  // See Dev Notes below.
  async uploadFile<T extends File>(
    file: T,
    targetPayload: presignPayload,
    onProgress,
    onDone,
    onError
  ) {
    const controller = new AbortController();

    const { presigned_url, file_id, s3_key, note_id, user_id } = targetPayload;

    const uploadStatus = {
      s3_upload_status: 'failure',
      file_db_update_status: 'failure',
      send_sqs_message_status: 'failure'
    };

    const s3DeleteURL = `/api/s3/${s3_key}`;
    const fileDeleteURL = `/api/files/${file_id}`;

    // 1) Upload file to s3.
    try {
      await fetch(presigned_url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
        signal: controller.signal
      });

      uploadStatus['s3_upload_status'] = 'success';

      this.uploads.set(file.name, controller);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      console.log(
        `Error in UploadManager.uploadFile uploading file with s3_key: ${s3_key}: ${message}`
      );

      return uploadStatus;
    }

    // 2) Make /api request to update File document s3_key property.
    try {
      const updateResponse: BackendResponse<unknown> = await fetch(
        '/api/files',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file_id, update: { s3_key } })
        }
      );

      if (updateResponse.status === 200) {
        uploadStatus['file_db_update_status'] = 'success';
      } else {
        throw new Error(
          `There was a problem updating the file ${file_id} with s3_key ${s3_key} in the database.`
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      console.log(
        `Error in UploadManager.uploadFile updating File ${file_id} in database: ${message}`
      );

      await fetch(s3DeleteURL, {
        method: 'DELETE'
      });

      await fetch(fileDeleteURL, {
        method: 'DELETE'
      });

      return uploadStatus;
    }

    // 3) Send SQS Message in Backend.
    try {
      const sqsResponse: BackendResponse<unknown> = await fetch(
        '/api/extractorqueue',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ note_id, user_id, s3_key })
        }
      );

      if (sqsResponse.status === 200) {
        uploadStatus['send_sqs_message_status'] = 'success';
      } else {
        throw new Error(
          `There was a problem sending a message to the Extractor Queue for user ${user_id} with s3_key ${s3_key}.`
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      console.log(
        `Error in UploadManager.uploadFile sending Extractor Queue Message for s3_key ${s3_key}: ${message}`
      );

      await fetch(s3DeleteURL, {
        method: 'DELETE'
      });

      await fetch(fileDeleteURL, {
        method: 'DELETE'
      });

      return uploadStatus;
    }

    return uploadStatus;
  }

  abortUpload(fileName) {
    const controller = this.uploads.get(fileName);
    controller?.abort();
  }
}

export const uploadManager = new UploadManager();

/***************************
  Notes
 ***************************

 1) uploadFile has 3 steps where we:
      - Upload the file to s3;
      - Update the File document with the uploaded s3_key; and
      - Send a Message to the SQS Extractor Queue.

    If the upload to s3 fails we return early, or if either the db
    update or sending the SQS message fails, we delete the uploaded
    s3 file and the file document in the db. In v1, it's an all or
    nothing operation and we don't want dangling files in s3 or
    in the database.

*/
