import { LeanFile, LeanNote } from '@/utils/mongodb';
import {
  createNoteFileDocs,
  handleFileDocUpdate,
  handleNoteDeletion,
  handleFileDeletion,
  noteFileResult
} from '@/actions/fileupload';

import { handlePresignedUrlsWithClient } from '@/utils/aws/s3';

export { createNoteFileDocs, handleFileDocUpdate };

/*************************************************
 * filterCurrentFiles
 **************************************************/

const filterCurrentFiles = <T extends File>(
  currentFiles: T[],
  fileDBResults: LeanFile[]
) => {
  const createdFiles = fileDBResults.map((leanFile) => leanFile.file_name);

  const filteredFiles = currentFiles.filter((file) =>
    createdFiles.includes(file.name)
  );

  return filteredFiles;
};

/******************************************************/

/*************************************************
 * verifyCreateNoteFileDocsResult
 **************************************************/

interface noteFileResValidationCheck<T extends File> {
  message: string;
  continue: boolean;
  noteFileResult: noteFileResult;
  currentFiles: T[];
}

export const verifyCreateNoteFileDocsResult = async <T extends File>(
  noteFileResult: noteFileResult,
  currentFiles: T[]
): Promise<noteFileResValidationCheck<T>> => {
  let temp = [...currentFiles];

  const { newNote, fileDBResults } = noteFileResult;

  const validationCheck: noteFileResValidationCheck<T> = {
    message: '',
    continue: false,
    noteFileResult: { newNote: [], fileDBResults: [] },
    currentFiles: []
  };

  // 1) There was a problem creating a Note, delete all created File documents.
  if (newNote.length === 0) {
    validationCheck['message'] =
      'There was a problem creating a Note for your files in the database. Try again later.';

    if (fileDBResults.length > 0) {
      const fileIDs = fileDBResults.map((leanFile) => leanFile._id);

      await handleFileDeletion(fileIDs);
    }

    return validationCheck;
  }

  // 2) There was a problem creating File documents for all the uploaded files, delete the parent Note document.
  if (fileDBResults.length === 0) {
    if (newNote.length > 0) {
      const [plucked] = newNote;
      await handleNoteDeletion(plucked);
    }

    validationCheck['message'] =
      'There was a problem saving your files in the database. Try uploading the files again later.';

    return validationCheck;
  }

  // 3) One of the uploaded files didn't get its File doucment created in the database, continue uploading files to s3.
  if (fileDBResults.length !== currentFiles.length) {
    temp = filterCurrentFiles(temp, fileDBResults);

    validationCheck['message'] =
      "Small Warning: It appears one of your files couldn't be saved. Try saving it again to the same Note later.";
  }

  const validatedResult = {
    newNote,
    fileDBResults
  };

  validationCheck['noteFileResult'] = validatedResult;

  validationCheck['currentFiles'] = temp;

  validationCheck['continue'] = true;

  return validationCheck;
};

/******************************************************/

/*************************************************
 * handlePresignedUrls
 **************************************************/

interface s3FilePayload {
  s3_key: string;
  file_id: string;
  file_name: string;
  presigned_url: string;
}

// See Note #1 below.
export const handlePresignedUrls = async (
  fileDocuments: LeanFile[]
): Promise<s3FilePayload[]> => {
  const presignResults = await Promise.allSettled(
    fileDocuments.map(async (fileDoc) => {
      const { file_name, note_id, user_id, _id } = fileDoc;

      const s3_key = `${user_id}/${note_id}/${_id}/${file_name}`;

      try {
        const presignedURL = await handlePresignedUrlsWithClient(s3_key);

        return {
          s3_key,
          file_id: _id,
          file_name,
          presigned_url: presignedURL
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
  s3PayloadResults: s3FilePayload[]
): Promise<s3UploadResult[]> => {
  const uploadResults = await Promise.allSettled(
    currentFiles.map(async (file) => {
      const targetName = file.name;
      const targetType = file.type;

      const [targetPayload] = s3PayloadResults.filter(
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
 * verifyUploadsUpdateFileDocs
 **************************************************/

interface validationFeedback {
  message: string;
  error: boolean;
}

export const verifyUploadsUpdateFileDocs = async (
  s3UploadResults: s3UploadResult[],
  s3PayloadResults: s3FilePayload[],
  newNote: LeanNote
): Promise<validationFeedback> => {
  const feedback = {
    message: '',
    error: true
  };

  // 1) None of the s3 Uploads were successful. Delete the created parent Note Document and File documents.
  if (s3UploadResults.length === 0) {
    const fileIDs = s3PayloadResults.map((filePayload) => filePayload.file_id);

    await handleFileDeletion(fileIDs);

    await handleNoteDeletion(newNote);

    feedback['message'] =
      'There was an error uploading your media files. Try recreating your Note and upload your files again later.';

    return feedback;
  }

  // 2) Some of the files failed to upload. Only delete the failed File uploads from the database.
  if (s3UploadResults.length !== s3PayloadResults.length) {
    const uploadIDs = s3UploadResults.map((uploadRes) => uploadRes.file_id);

    const failedFilePayloads = s3PayloadResults.filter((payloadRes) => {
      const targetID = payloadRes.file_id;

      return uploadIDs.includes(targetID) === false;
    });

    const failedFileIDs = failedFilePayloads.map(
      (failPayload) => failPayload.file_id
    );

    await handleFileDeletion(failedFileIDs);

    await handleFileDocUpdate(s3UploadResults);

    feedback['message'] =
      'Only some of your files were uploaded successfully. Please re-upload the failed file uploads later.';
  }

  // 3) All the files were uploaded successfully.
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
