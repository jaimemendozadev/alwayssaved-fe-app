'use server';

import { NoteModel } from '@/utils/mongodb';
import { getUserFromDB } from '..';

export const getNotesForSideNav = async () => {
  const currentUser = await getUserFromDB();

  if (!currentUser) {
    throw new Error(
      "Can't find the user to retrieve their notes in getUserNotes."
    );
  }

  const user_id = currentUser._id;

  const foundNotes = await NoteModel.aggregate([
    { $match: { user_id } },
    { $project: { _id: 1, title: 1 } }
  ]);

  console.log('foundNotes in getUserNotes ', foundNotes);
};
