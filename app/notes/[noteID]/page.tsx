'use server';
import { ReactNode } from 'react';
import { getUserFromDB } from '@/actions';
import { NumberNoteMainUI } from '@/components/[noteID]';
import { getNoteByID } from '@/actions/schemamodels/notes';
import { getFilesByNoteID } from '@/actions/schemamodels/files';

export default async function NotePage({
  params
}: {
  params: { noteID: string };
}): Promise<ReactNode> {
  const { noteID } = await params;

  const currentNote = await getNoteByID(noteID);

  const currentUser = await getUserFromDB();

  let files = null;

  console.log('currentNote in NotePage Server component ', currentNote);

  if (currentNote) {
    files = await getFilesByNoteID(noteID);
  }

  if (currentUser && currentNote) {
    return (
      <NumberNoteMainUI currentUser={currentUser} currentNote={currentNote} />
    );
  }
  throw new Error(`There was an error displaying the Note Page for ${noteID}`);
}
