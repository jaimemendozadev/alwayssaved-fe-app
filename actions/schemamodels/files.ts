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
  date_deleted?: number;
}

interface FileMatch {
  _id?: unknown;
  user_id?: unknown;
  note_id?: unknown;
  s3_key?: unknown;
  file_name?: unknown;
  file_type?: unknown;
  date_uploaded?: unknown;
  date_deleted?: unknown;
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

  if (!foundNote || !foundFile) {
    throw new Error(`Can Perform File deletion for File ${fileID}.`);
  }

  if (fileType !== '.txt') {
    // TODO: Handle '.mp3' and '.mp4' deletion
  }
};
