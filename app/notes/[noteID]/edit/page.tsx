'use server';
import { ReactNode } from 'react';
import { getUserFromDB } from '@/actions';
import { EditNoteMainUI } from '@/components/[noteID]';
import { getNotesByFields } from '@/actions/schemamodels/notes';
import { matchProjectFiles } from '@/actions/schemamodels/files';
import { getObjectIDFromString, LeanNote } from '@/utils/mongodb';

export default async function NoteEditPage({
  params
}: {
  params: { noteID: string };
}): Promise<ReactNode> {
  const { noteID } = await params;

  const currentUser = await getUserFromDB();

  let currentNote: LeanNote | undefined = undefined;

  if (currentUser) {
    [currentNote] = await getNotesByFields(
      {
        user_id: getObjectIDFromString(currentUser._id),
        date_deleted: { $eq: null }
      },
      {
        _id: 1,
        title: 1
      }
    );
  }

  if (!currentNote) {
    throw new Error("You're trying to edit a Note that has been deleted.");
  }

  let files = null;

  if (currentNote && currentUser) {
    files = await matchProjectFiles(
      {
        user_id: getObjectIDFromString(currentUser._id),
        note_id: getObjectIDFromString(currentNote._id)
      },
      {
        _id: 1,
        s3_key: 1,
        file_name: 1,
        file_type: 1
      }
    );
  }

  if (currentUser && currentNote && files && noteID) {
    return (
      <EditNoteMainUI
        currentUser={currentUser}
        currentNote={currentNote}
        noteFiles={files}
        currentNoteID={noteID}
      />
    );
  }
  throw new Error(`There was an error displaying the Note Page for ${noteID}`);
}
