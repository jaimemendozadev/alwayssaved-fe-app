'use server';
import {
  deepLean,
  getObjectIDFromString,
  LeanNote,
  NoteModel
} from '@/utils/mongodb';
import { PipelineStage } from 'mongoose';

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
  docFields: SpecifiedNoteFields,
  sortByDate: boolean = false
): Promise<LeanNote[]> => {
  const pipeline: PipelineStage[] = [
    { $match: { user_id: getObjectIDFromString(userID) } },
    { $project: docFields }
  ];

  if (sortByDate) {
    pipeline.push({ $sort: { date: -1 } });
  }

  const foundNotes = await NoteModel.aggregate(pipeline);

  return deepLean(foundNotes);
};

export const updateNoteByID = async (
  noteID: string,
  update: { [key: string]: any },
  options: { [key: string]: any } = {}
): Promise<void> => {
  await NoteModel.findByIdAndUpdate(
    getObjectIDFromString(noteID),
    update,
    options
  );
};

export const deleteNoteByID = async (noteID: string): Promise<void> => {
  try {
    const _id = getObjectIDFromString(noteID);

    await NoteModel.findOneAndDelete({ _id }).exec();
  } catch (error) {
    // TODO: Handle in telemetry.
    console.log(
      `Error in deleteNoteByID for Note with ID of ${noteID}:`,
      error
    );
  }
};
