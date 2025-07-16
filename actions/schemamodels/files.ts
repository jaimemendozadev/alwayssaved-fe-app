'use server';
import { PipelineStage } from 'mongoose';
import { deleteFileFromS3 } from '@/utils/aws';
import {
  deepLean,
  FileModel,
  getObjectIDFromString,
  LeanFile
} from '@/utils/mongodb';
import { getQdrantDB } from '@/utils/qdrant';

const { QDRANT_COLLECTION_NAME } = process.env;

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

  // 1) Delete the file from s3.
  const s3Response = await deleteFileFromS3(foundFile.s3_key);

  if (s3Response.$metadata.httpStatusCode !== 204) {
    throw new Error(
      `There was a problem deleting your File ${fileID} of type ${fileType} from s3. Try again later.`
    );
  }

  // 2) Delete the Qdrant points if it's a .txt file.
  if (fileType === '.txt') {
    const qdrantDB = await getQdrantDB();

    if (qdrantDB && QDRANT_COLLECTION_NAME) {
      console.log('deleting .txt file from Qdrant ', foundFile);
      console.log('\n');

      const qdrantRes = await qdrantDB.delete(QDRANT_COLLECTION_NAME, {
        filter: {
          must: [
            {
              key: 'note_id',
              match: { value: foundFile.note_id.toString() }
            },
            {
              key: 'file_id',
              match: { value: foundFile._id.toString() }
            },
            {
              key: 'user_id',
              match: { value: foundFile.user_id.toString() }
            },
            {
              key: 's3_key',
              match: { value: foundFile.s3_key }
            }
          ]
        },
        wait: true
      });

      console.log('qdrantRes for point deletion ', qdrantRes);
      console.log('\n');
    } else {
      throw new Error(
        `There was a problem getting the Qdrant Database connection for File ${fileID}.`
      );
    }
  }

  // 3) Update the document's date_deleted field.
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
    - Deleting the Qdrant Vector DB points if it's a '.txt' file.

 */
