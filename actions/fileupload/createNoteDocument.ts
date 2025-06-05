'use server';
import {
  dbConnect,
  LeanNote,
  getObjectIDFromString,
  NoteModel,
  deepLean
} from '@/utils/mongodb';

export const createNoteDocument = async (
  currentUserID: string,
  noteTitle: string
): Promise<LeanNote | void> => {
  try {
    await dbConnect();

    // 1) Create a single MongoDB Note document.
    const userMongoID = getObjectIDFromString(currentUserID);

    const notePayload = {
      user_id: userMongoID,
      title: noteTitle
    };

    const [createdNote] = await NoteModel.create([notePayload], { j: true });

    if (!createdNote) {
      throw new Error(
        `There was a problem creating a Note document for user ${currentUserID} in createNoteFileDocs.`
      );
    }

    return deepLean(createdNote);
  } catch (error) {
    //TODO: Handle in telemetry.
    console.log('Error in createNoteDocument ', error);
  }
};
