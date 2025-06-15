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
      file_db_update_status: 'failure'
    };

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
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      console.log(
        `Error in UploadManager.uploadFile updating File ${file_id} in database: ${message}`
      );
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
        return {
          s3_key,
          note_id,
          user_id
        };
      }
    } catch (error) {}

    return {};
  }

  abortUpload(fileName) {
    const controller = this.uploads.get(fileName);
    controller?.abort();
  }
}

export const uploadManager = new UploadManager();
