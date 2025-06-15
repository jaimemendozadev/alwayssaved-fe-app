import { presignPayload } from '@/actions/fileuploadcontext/handlePresignedUrls';

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

      // 2) Make /api request to update File document s3_key property.
      await fetch('/api/files', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id, s3_key })
      });

      /*
          SQS Payload Shape

          {
            s3_key,
            note_id,
            user_id
          }

     */

      // 3) Send SQS Message in Backend.


      
      return {
        s3_key,
        note_id,
        user_id
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      throw new Error(
        `Error in handleS3FileUploads for s3_key: ${s3_key}: ${message}`
      );
    }

    this.uploads.set(file.name, controller);

    return promise;
  }

  abortUpload(fileName) {
    const controller = this.uploads.get(fileName);
    controller?.abort();
  }
}

export const uploadManager = new UploadManager();
