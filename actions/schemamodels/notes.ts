'use server';
import mongoose from 'mongoose';
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

interface SearchNoteFields {
  _id?: unknown;
  user_id?: unknown;
  title?: unknown;
  date_created?: unknown;
  date_deleted?: unknown;
  files?: unknown;
}

// TODO: May need to refactor sortBy argument for better sorting options.
export const getNotesByFields = async (
  searchParams: SearchNoteFields,
  docFields: SpecifiedNoteFields,
  sortByDateCreated: boolean = false
): Promise<LeanNote[]> => {
  const pipeline: PipelineStage[] = [
    { $match: searchParams },
    { $project: docFields }
  ];

  if (sortByDateCreated) {
    pipeline.push({ $sort: { date_created: -1 } });
  }

  const foundNotes = await NoteModel.aggregate(pipeline);

  return deepLean(foundNotes);
};

export const updateNoteByID = async (
  noteID: string,
  update: { [key: string]: unknown },
  options: { [key: string]: unknown } = {}
): Promise<void> => {
  await NoteModel.findByIdAndUpdate(
    getObjectIDFromString(noteID),
    update,
    options
  );
};

// See Dev Notes below.
export const deleteNoteByID = async (noteID: string): Promise<LeanNote> => {
  const _id = getObjectIDFromString(noteID);

  const deleteDate = new Date();

  const deleteUpdate = await NoteModel.findOneAndUpdate(
    _id,
    { date_deleted: deleteDate },
    { returnDocument: 'after' }
  ).exec();

  if (!deleteUpdate || deleteUpdate.date_deleted === null) {
    throw new Error(
      `There was a problem deleting the Note ${noteID}. Try again later`
    );
  }

  return deepLean(deleteUpdate);
};

/********************************************
 * Notes
 ********************************************

 1) For MVP v1, deleteNoteByID "deletes" a Note by updating
    the date_deleted property. In a separate async job,
    a proper Note deletion will involve:

    - Getting all the Note's File DB references in NoteModel.files[].
      - Deleting all Note's Files from s3.
      - Deleting all the Vector points in Vector DB.
      - Deleting File DB document.
    - Deleting the Note DB document.


 */
