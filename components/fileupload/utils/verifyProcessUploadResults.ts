import {
  handleFileDocUpdate,
  handleNoteDeletion,
  handleFileDeletion,
} from '@/actions/fileupload';

import { LeanNote } from '@/utils/mongodb';
import { presignPayload } from '@/actions/fileupload/handlePresignedUrls';

import { s3UploadResult } from './handleS3FileUploads';

export interface s3MediaUpload {
  s3_key: string;
  note_id: string;
  user_id: string;
}

interface validationFeedback {
  message: string;
  error: boolean;
  sqsPayload: s3MediaUpload[];
}

export const verifyProcessUploadResults = async (
  s3UploadResults: s3UploadResult[],
  s3RequestPayloads: presignPayload[],
  newNote: LeanNote
): Promise<validationFeedback> => {
  // 1) Prep s3UploadResults for sendSQSMessage, if any.
  const note_id = newNote._id;
  const user_id =
    typeof newNote.user_id === 'string' ? newNote.user_id : newNote.user_id._id;

  const sqsPayload = s3UploadResults.map((uploadResult) => {
    const { update } = uploadResult;
    const { s3_key } = update;

    return {
      s3_key,
      note_id,
      user_id
    };
  });

  const feedback: validationFeedback = {
    message: '',
    error: true,
    sqsPayload
  };

  // 2) None of the s3 Uploads were successful. Delete the created parent Note Document and File documents.
  if (s3UploadResults.length === 0) {
    const fileIDs = s3RequestPayloads.map((filePayload) => filePayload.file_id);

    await handleFileDeletion(fileIDs);

    await handleNoteDeletion(newNote);

    feedback['message'] =
      'There was an error uploading your media files. Try recreating your Note and upload your files again later.';

    return feedback;
  }

  // 3) Some of the files failed to upload. Only delete the failed File uploads from the database.
  if (s3UploadResults.length !== s3RequestPayloads.length) {
    const uploadIDs = s3UploadResults.map((uploadRes) => uploadRes.file_id);

    const failedFilePayloads = s3RequestPayloads.filter((payloadRes) => {
      const targetID = payloadRes.file_id;

      return uploadIDs.includes(targetID) === false;
    });

    const failedFileIDs = failedFilePayloads.map(
      (failPayload) => failPayload.file_id
    );

    await handleFileDeletion(failedFileIDs);

    await handleFileDocUpdate(s3UploadResults);

    feedback['error'] = false;

    feedback['message'] =
      'Most of your files were successfully uploaded. Please re-upload the failed file uploads later.';

    return feedback;
  }

  // 4) All the files were uploaded successfully.
  await handleFileDocUpdate(s3UploadResults);

  feedback['error'] = false;
  feedback['message'] = 'Your files were successfully uploaded.';

  return feedback;
};
