'use server';
import { PipelineStage } from 'mongoose';
import { deleteFileFromS3 } from '@/utils/aws';
import {
  deepLean,
  FileModel,
  getObjectIDFromString,
  LeanFile
} from '@/utils/mongodb';

export const getFilesByNoteID = async (
  noteID: string
): Promise<LeanFile[] | void> => {
  const mongoID = getObjectIDFromString(noteID);

  const noteFiles = await FileModel.find({ note_id: mongoID }).exec();

  // TODO: Need to delete possibly fix return value.
  console.log('noteFiles in getFilesByNoteID ', noteFiles);

  if (noteFiles.length === 0) return;

  return deepLean(noteFiles);
};

export const matchProjectFiles = async (
  pipeline: PipelineStage[]
): Promise<LeanFile[]> => {
  const foundNotes = await FileModel.aggregate(pipeline);

  return deepLean(foundNotes);
};

// See Dev Notes below.
export const purgeFileByID = async (
  fileID: string,
  fileType: string
): Promise<LeanFile> => {
  const convertedFileID = getObjectIDFromString(fileID);

  const foundFile = await FileModel.findById(convertedFileID).exec();

  if (!foundFile) {
    throw new Error(
      `Can Perform File deletion for File ${fileID} of type ${fileType}.`
    );
  }

  const s3Response = await deleteFileFromS3(foundFile.s3_key);

  if (s3Response.$metadata.httpStatusCode !== 204) {
    throw new Error(
      `There was a problem deleting your File ${fileID} of type ${fileType} from s3. Try again later.`
    );
  }

  const updatedFile = await FileModel.findByIdAndUpdate(
    convertedFileID,
    { date_deleted: new Date() },
    {
      new: true
    }
  ).exec();

  if (!updatedFile || updatedFile.date_deleted === null) {
    throw new Error(
      `There was a problem deleting your File ${fileID} of type ${fileType}. Try again later`
    );
  }

  return deepLean(updatedFile);
};

/********************************************
 * Notes
 ********************************************

 1) For MVP v1, purgeFileByID "deletes" by 
    - Deleting the File from s3.
    - Updating the File.date_deleted property to today's date.

    If the file is .txt file, deleting al the Qdrant
    Vector DB points will have to be done in a 
    separate async job. For MVP, it's enough just to
    delete the files from s3 and update the File
    date_deleted property. A separate Async job will
    remove the deleted MongoDB documents and any
    Qdrant Vector DB points if any.
    


 */
