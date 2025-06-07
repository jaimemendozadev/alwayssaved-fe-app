'use server';
import {
  dbConnect,
  LeanNote,
  NoteModel,
  getObjectIDFromString
} from '@/utils/mongodb';

import { createFileDocuments } from './createFileDocuments';
import { createNoteDocument } from './createNoteDocument';
import { handleFileDeletion } from './handleFileDeletion';
import { handleFileDocUpdate } from './handleFileDocUpdate';
import { handlePresignedUrls } from './handlePresignedUrls';


export {
  createFileDocuments,
  createNoteDocument,  
  handleFileDeletion,
  handleFileDocUpdate,
  handlePresignedUrls,
}



/*************************************************
 * handleNoteDeletion
 **************************************************/

export const handleNoteDeletion = async (newNote: LeanNote): Promise<void> => {
  try {
    await dbConnect();

    const _id = getObjectIDFromString(newNote._id);

    await NoteModel.findOneAndDelete({ _id }).exec();
  } catch (error) {
    // TODO: Handle in telemetry.
    console.log(
      `Error in handleNoteDeletion for Note with ID of ${newNote._id}:`,
      error
    );
  }
};

/***************************************************/

