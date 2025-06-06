import { LeanFile, LeanNote } from '@/utils/mongodb';
import {
  handleFileDocUpdate,
  handleNoteDeletion,
  handleFileDeletion,
  presignPayload,
  createFileDocuments,
  createNoteDocument
} from '@/actions/fileupload';


export { handleFileDocUpdate, createFileDocuments, createNoteDocument };




/*************************************************
 * filterCurrentFiles
 **************************************************/

export const filterCurrentFiles =  <T extends File>(
  currentFiles: T[], 
  targetFiles: LeanFile[] | presignPayload[]
): T[] => {

  const arrayOfFileNames = targetFiles.map((leanFile) => leanFile.file_name);

  const filteredFiles = currentFiles.filter((file) =>
    arrayOfFileNames.includes(file.name)
  );

  return filteredFiles;

};

/******************************************************/



/*************************************************
 * handleS3FileUploads
 **************************************************/

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

  console.log("uploadResults in handleS3FileUploads ", uploadResults);

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

/******************************************************/

/*************************************************
 * verifyProcessUploadResults
 **************************************************/

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

/******************************************************/

/********************************************
 * Notes
 ********************************************

 1) Media assets are stored in s3 in the following s3 Key format: 

    /{fileOwner}/{noteID}/{fileID}/{fileName}.{fileExtension} 

    fileOwner: is the User._id
    fileName: is the name of the file with the fileType extension 

*/
