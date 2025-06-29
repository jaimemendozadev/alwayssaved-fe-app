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

export const getFilesByFields = async (
  userID: string,
  docFields: SpecifiedFileFields
): Promise<LeanFile[]> => {
  const foundNotes = await FileModel.aggregate([
    { $match: { user_id: getObjectIDFromString(userID) } },
    { $project: docFields }
  ]);

  return deepLean(foundNotes);
};
