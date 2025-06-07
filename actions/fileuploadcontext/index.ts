'use server';
import {
  dbConnect,
  LeanFile,
  LeanNote,
  NoteModel,
  FileModel,
  getObjectIDFromString
} from '@/utils/mongodb';

import { handlePresignedUrlsWithClient } from '@/utils/aws';
import { s3UploadResult } from '@/utils/context/filteruploadcontext/utils';

import { createNoteDocument } from './createNoteDocument';
import { createFileDocuments } from './createFileDocuments';

import { handleFileDeletion } from './handleFileDeletion';

export {
  createNoteDocument,
  createFileDocuments,
  handleFileDeletion

}



/*************************************************
 * handleNoteDeletion
 **************************************************/

export const handleNoteDeletion = async (newNote: LeanNote): Promise<void> => {
  try {
    await dbConnect();

    const _id = getObjectIDFromString(newNote._id);

    await NoteModel.findOneAndDelete({ _id }).exec();
  } catch (error) {
    // TODO: Handle in telemetry.
    console.log(
      `Error in handleNoteDeletion for Note with ID of ${newNote._id}:`,
      error
    );
  }
};

/***************************************************/

/*************************************************
 * handleFileDocUpdate
 **************************************************/

interface UpdateStatus {
  file_id: string;
  update_status: string;
}

export const handleFileDocUpdate = async (
  fileUpdates: s3UploadResult[]
): Promise<UpdateStatus[]> => {
  const updateResults = await Promise.allSettled(
    fileUpdates.map(async (updateInfo) => {
      const { file_id, update } = updateInfo;

      try {
        const targetID = getObjectIDFromString(file_id);

        const updatedFile = await FileModel.findByIdAndUpdate(
          targetID,
          update,
          {
            new: true
          }
        ).exec();

        console.log('updatedFile ', updatedFile);

        return {
          file_id,
          update_status: 'success'
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        throw new Error(
          `Error in handleFileDocUpdate for file_id ${file_id}: ${message}`
        );
      }
    })
  );

  // Log File Deletion Failures
  updateResults.forEach((result) => {
    if (result.status === 'rejected') {
      // TODO: Handle in telemetry.
      console.error('File document update failed:', result.reason);
    }
  });

  const filteredResults = updateResults.filter(
    (result) => result.status === 'fulfilled'
  );

  const finalizedResults = filteredResults.map((result) => result.value);

  return finalizedResults;
};

/***************************************************/



/*************************************************
 * handlePresignedUrls
 **************************************************/

export interface presignPayload {
  s3_key: string;
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
