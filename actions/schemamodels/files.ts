'use server';
import mongoose from 'mongoose';
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

export const purgeFileByID = async (fileID: string): Promise<void> => {
  const convertedID = getObjectIDFromString(fileID);

  const foundFile = await FileModel.findById(convertedID).exec();

  console.log('foundFile in purgeFileByID ', foundFile);

  if (foundFile) {
    const { s3_key } = foundFile;

    const s3Result = await deleteFileFromS3(s3_key);

    console.log('s3Result in purgeFileByID ', s3Result);
    console.log('\n');

    if (s3Result && s3Result.$metadata) {
      const statusCode = s3Result.$metadata.httpStatusCode;

      if (statusCode === 204) {
        await FileModel.findByIdAndDelete(convertedID).exec();
      }
    }
  }
};
