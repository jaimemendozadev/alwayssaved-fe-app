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

    /*
       1) Upload file to s3.
         - Return early if s3 upload fails.

    */
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

    /*
       2) Make /api request to update File document s3_key property.
         - Delete the uploaded file in s3 bucket and File document in database if File document update fails.
    */
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

      const s3DeleteURL = `/api/s3/${s3_key}`;

      await fetch(s3DeleteURL, {
        method: 'DELETE'
      });

      const fileDeleteURL = `/api/files/${file_id}`;

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
    }

    return uploadStatus;
  }

  abortUpload(fileName) {
    const controller = this.uploads.get(fileName);
    controller?.abort();
  }
}

export const uploadManager = new UploadManager();
