'use server';
import { ReactNode } from 'react';
import { getUserFromDB } from '@/actions';
import { NumberNoteMainUI } from '@/components/[noteID]';
import { getNoteByID } from '@/actions/schemamodels/notes';
import { getFilesByFields } from '@/actions/schemamodels/files';

export default async function NotePage({
  params
}: {
  params: { noteID: string };
}): Promise<ReactNode> {
  const { noteID } = await params;

  const currentNote = await getNoteByID(noteID);

  const currentUser = await getUserFromDB();

  let files = null;

  if (currentNote && currentUser) {
    files = await getFilesByFields(currentUser._id, {
      _id: 1,
      s3_key: 1,
      file_name: 1,
      file_type: 1
    });
  }

  if (currentUser && currentNote && files) {
    return (
      <NumberNoteMainUI
        currentUser={currentUser}
        currentNote={currentNote}
        noteFiles={files}
      />
    );
  }
  throw new Error(`There was an error displaying the Note Page for ${noteID}`);
}
