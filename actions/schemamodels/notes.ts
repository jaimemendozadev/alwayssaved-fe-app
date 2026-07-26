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

// Signature of pipeline can be [{$match},{$project},{$sort}]
export const matchProjectNotes = async (
  pipeline: PipelineStage[]
): Promise<LeanNote[]> => {
  const foundNotes = await NoteModel.aggregate(pipeline);

  return deepLean(foundNotes);
};

export const updateNoteByID = async (
  noteID: string,
  update: { [key: string]: unknown },
  options: { [key: string]: unknown } = {}
): Promise<LeanNote | void> => {
  try {
    const dbRes = await NoteModel.findByIdAndUpdate(
      getObjectIDFromString(noteID),
      update,
      options
    );

    if (dbRes) {
      return deepLean(dbRes);
    }

    throw new Error(`There was a problem updating note ${noteID}`);
  } catch (error) {
    // TODO: Handle in Telemetry.
    console.log('Error in updateNoteByID, ', error);
  }
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
