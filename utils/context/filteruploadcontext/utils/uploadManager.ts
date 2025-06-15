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

    try {
      // 1) Upload file to s3.
      await fetch(presigned_url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
        signal: controller.signal
      });

      this.uploads.set(file.name, controller);

      // 2) Make /api request to update File document s3_key property.
      const updateResponse: BackendResponse<unknown> = await fetch(
        '/api/files',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file_id, s3_key })
        }
      );

      if (updateResponse.status === 200) {
        // 3) Send SQS Message in Backend.
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
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      console.log(
        `Error in UploadManager.uploadFile for s3_key: ${s3_key}: ${message}`
      );
    }

    return {};
  }

  abortUpload(fileName) {
    const controller = this.uploads.get(fileName);
    controller?.abort();
  }
}

export const uploadManager = new UploadManager();
