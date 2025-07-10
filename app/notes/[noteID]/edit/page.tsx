'use server';
import { ReactNode } from 'react';
import { getUserFromDB } from '@/actions';
import { EditNoteMainUI } from '@/components/[noteID]';
import { matchProjectNotes } from '@/actions/schemamodels/notes';
import { matchProjectFiles } from '@/actions/schemamodels/files';
import { getObjectIDFromString } from '@/utils/mongodb';

export default async function NoteEditPage({
  params
}: {
  params: { noteID: string };
}): Promise<ReactNode> {
  const { noteID } = await params;

  const currentUser = await getUserFromDB();

  if (!noteID || !currentUser) {
    throw new Error(
      `There was a problem editing Note ${noteID}. Try again later.`
    );
  }

  const [currentNote] = await matchProjectNotes(
    {
      _id: getObjectIDFromString(noteID),
      user_id: getObjectIDFromString(currentUser._id),
      date_deleted: { $eq: null }
    },
    {
      _id: 1,
      title: 1
    }
  );

  if (!currentNote) {
    throw new Error(
      `There was a problem editing Note ${noteID}. Try again later.`
    );
  }

  const files = await matchProjectFiles(
    {
      user_id: getObjectIDFromString(currentUser._id),
      note_id: getObjectIDFromString(currentNote._id),
      date_deleted: { $eq: null }
    },
    {
      _id: 1,
      s3_key: 1,
      file_name: 1,
      file_type: 1,
      date_deleted: 1
    }
  );

  return (
    <EditNoteMainUI
      currentUser={currentUser}
      currentNote={currentNote}
      noteFiles={files}
      currentNoteID={noteID}
    />
  );
}
