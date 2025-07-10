'use server';
import { ReactNode } from 'react';
import { getUserFromDB } from '@/actions';
import { ClientUI } from '@/components/notes/[noteID]/convos/new';
import { getNoteByID } from '@/actions/schemamodels/notes';

export default async function NewConvoPage({
  params
}: {
  params: { noteID: string };
}): Promise<ReactNode> {
  const currentUser = await getUserFromDB();
  const { noteID } = await params;

  console.log('noteID in New Conversation Page ', noteID);

  if (!currentUser || !noteID) {
    throw new Error(
      `There was an error creating a new conversation for Note ${noteID}. Try again later.`
    );
  }

  const currentNote = getNoteByID(noteID);

  if (!currentNote) {
    throw new Error(
      `There was an error creating a new conversation for User ${currentUser._id} Note ${noteID}. Try again later.`
    );
  }

  return <ClientUI currentNote={currentNote} currentUser={currentUser} />;
}
