'use server';
import { ReactNode } from 'react';
import { getUserFromDB } from '@/actions';
import { EditNoteMainUI } from '@/components/[noteID]';
import { getNoteByID } from '@/actions/schemamodels/notes';
import { matchProjectFiles } from '@/actions/schemamodels/files';
import { getObjectIDFromString } from '@/utils/mongodb';

export default async function NoteEditPage({
  params
}: {
  params: { noteID: string };
}): Promise<ReactNode> {
  const { noteID } = await params;

  const currentNote = await getNoteByID(noteID);

  const currentUser = await getUserFromDB();

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
