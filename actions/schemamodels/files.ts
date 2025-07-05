'use server';
import mongoose from 'mongoose';
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
