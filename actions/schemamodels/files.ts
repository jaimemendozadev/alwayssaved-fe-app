'use server';
import mongoose from 'mongoose';
import { deleteFileFromS3 } from '@/utils/aws';
import {
  deepLean,
  FileModel,
  getObjectIDFromString,
  LeanFile,
  NoteModel
} from '@/utils/mongodb';

import { getQdrantDB } from '@/utils/qdrant';

export const getFilesByNoteID = async (
  noteID: string
): Promise<LeanFile[] | void> => {
  const mongoID = getObjectIDFromString(noteID);

  const noteFiles = await FileModel.find({ note_id: mongoID }).exec();

  console.log('noteFiles in getFilesByNoteID ', noteFiles);

  if (noteFiles.length === 0) return;

  return deepLean(noteFiles);
};

interface SpecifiedFileFields {
  _id?: number;
  user_id?: number;
  note_id?: number;
  s3_key?: number;
  file_name?: number;
  file_type?: number;
  date_uploaded?: number;
}

interface FileMatch {
  _id?: mongoose.Types.ObjectId;
  user_id?: mongoose.Types.ObjectId;
  note_id?: mongoose.Types.ObjectId;
  s3_key?: string;
  file_name?: string;
  file_type?: string;
  date_uploaded?: Date;
}

export const matchProjectFiles = async (
  match: FileMatch,
  docFields: SpecifiedFileFields
): Promise<LeanFile[]> => {
  const foundNotes = await FileModel.aggregate([
    { $match: match },
    { $project: docFields }
  ]);

  return deepLean(foundNotes);
};

export const purgeFileByID = async (
  noteID: string,
  fileID: string,
  fileType: string
): Promise<void> => {
  const convertedFileID = getObjectIDFromString(fileID);
  const convertedNoteID = getObjectIDFromString(noteID);

  const foundNote = await NoteModel.findById(convertedNoteID).exec();

  const foundFile = await FileModel.findById(convertedFileID).exec();

  console.log('foundNote in purgeFileByID ', foundNote);
  console.log('\n');

  console.log('foundFile in purgeFileByID ', foundFile);
  console.log('\n');

  if (fileType !== '.txt') {
    // TODO: Handle '.mp3' and '.mp4' deletion
  }

  const { QDRANT_COLLECTION_NAME } = process.env;

  if (!foundNote || !foundFile || !QDRANT_COLLECTION_NAME) {
    throw new Error(`Can Perform File deletion for File `);
  }

  const qdrantClient = await getQdrantDB();

  if (!qdrantClient) {
    throw new Error(
      `Can't purgeFileByID for File ${fileID} Note ${noteID}due to missing Qdrant Client.`
    );
  }
};
