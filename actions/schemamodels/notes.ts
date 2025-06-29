'use server';
import {
  deepLean,
  getObjectIDFromString,
  LeanNote,
  NoteModel
} from '@/utils/mongodb';

export const getNoteByID = async (noteID: string): Promise<LeanNote | void> => {
  const mongoID = getObjectIDFromString(noteID);
  const foundNote = await NoteModel.findById(mongoID).exec();

  if (!foundNote) {
    throw new Error(`Can't find a note with an ID of ${noteID}`);
  }

  return deepLean(foundNote);
};

interface SpecifiedNoteFields {
  _id?: number;
  user_id?: number;
  title?: number;
  date_created?: number;
  date_deleted?: number;
  files?: number;
}

export const getNotesByFields = async (
  userID: string,
  docFields: SpecifiedNoteFields
): Promise<LeanNote[]> => {
  const foundNotes = await NoteModel.aggregate([
    { $match: { user_id: getObjectIDFromString(userID) } },
    { $project: docFields }
  ]);

  return deepLean(foundNotes);
};
