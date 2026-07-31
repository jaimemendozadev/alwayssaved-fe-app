'use server';
import {
  ConversationModel,
  ConvoMessageModel,
  deepLean,
  FileModel,
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

// See Dev Note #1 below.
export const deleteNoteByID = async (noteID: string): Promise<LeanNote> => {
  const note_id = getObjectIDFromString(noteID);
  const date_deleted = new Date();

  // Mark Note for deletion
  const deleteUpdate = await NoteModel.findOneAndUpdate(
    note_id,
    { date_deleted },
    { returnDocument: 'after' }
  ).exec();

  if (!deleteUpdate || deleteUpdate.date_deleted === null) {
    throw new Error(
      `There was a problem deleting the Note ${noteID}. Try again later`
    );
  }

  // Mark attached Conversations for deletion
  await ConversationModel.updateMany({ note_id }, { date_deleted }).exec();

  // Mark attached ConvoMessages for deletion
  await ConvoMessageModel.updateMany({ note_id }, { date_deleted }).exec();

  // Mark attached Files for deletion
  await FileModel.updateMany({ note_id }, { date_deleted }).exec();

  return deepLean(deleteUpdate);
};

/********************************************
 * Notes
 ********************************************

 1) For MVP v1, deleteNoteByID "deletes" a Note by updating
    the date_deleted property. 
    
    In a separate async job, a proper Note deletion will involve:

    - Deleting all Note's Files from s3.
    - Deleting all the Note's Vector points in Vector DB.
    - Deleting the Note, Convo, ConvoMessages, and File documents from DB.


 */
