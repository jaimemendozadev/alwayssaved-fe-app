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

  if (noteFiles.length === 0) return;

  return deepLean(noteFiles);
};

export const matchProjectFiles = async (
  pipeline: PipelineStage[]
): Promise<LeanFile[]> => {
  const foundNotes = await FileModel.aggregate(pipeline);

  return deepLean(foundNotes);
};

// See Dev Note #1 below.
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
      const note_id = foundFile.note_id.toString();
      const file_id = foundFile._id.toString();
      const user_id = foundFile.user_id.toString();

      const qdrantFilter = {
        must: [
          { key: 'note_id', match: { value: note_id } },
          { key: 'file_id', match: { value: file_id } },
          { key: 'user_id', match: { value: user_id } }
        ]
      };

      console.log(`🔍 Scrolling Qdrant for points to delete...`);
      const scrollResult = await qdrantDB.scroll(QDRANT_COLLECTION_NAME, {
        filter: qdrantFilter,
        limit: 10
      });

      const matchedPoints = scrollResult?.points || [];

      if (matchedPoints.length === 0) {
        console.warn(
          `⚠️ No Qdrant points matched for note_id: ${note_id}, file_id: ${file_id}, user_id: ${user_id}. Skipping delete.`
        );
      } else {
        console.log(
          `🗑️ Found ${matchedPoints.length} Qdrant point(s) to delete. Proceeding...`
        );

        // TODO: Should we do something with qdrantResult of { operation_id: num, status: 'completed' }?
        const qdrantRes = await qdrantDB.delete(QDRANT_COLLECTION_NAME, {
          filter: qdrantFilter,
          wait: true
        });

        console.log('✅ Qdrant delete result in purgeFileByID: ', qdrantRes);
      }
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
