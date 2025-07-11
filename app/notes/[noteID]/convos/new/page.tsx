'use server';
import { ReactNode } from 'react';
import { getUserFromDB } from '@/actions';
import { ClientUI } from '@/components/notes/[noteID]/convos/new';
import { getNoteByID } from '@/actions/schemamodels/notes';
import {
  createConversation,
  matchProjectConversations
} from '@/actions/schemamodels/conversations';
import { getObjectIDFromString } from '@/utils/mongodb';

export default async function NewConvoPage({
  params
}: {
  params: { noteID: string };
}): Promise<ReactNode> {
  const currentUser = await getUserFromDB();
  const { noteID } = await params;

  if (!currentUser || !noteID) {
    throw new Error(
      `There was an error creating a new conversation for Note ${noteID}. Try again later.`
    );
  }

  const currentNote = await getNoteByID(noteID);

  if (!currentNote) {
    throw new Error(
      `There was an error creating a new conversation for User ${currentUser._id} Note ${noteID}. Try again later.`
    );
  }

  let [targetConvo] = await matchProjectConversations(
    {
      user_id: getObjectIDFromString(currentUser._id),
      note_id: getObjectIDFromString(currentNote._id),
      date_deleted: { $eq: null },
      date_archived: { $eq: null }
    },
    { _id: 1, user_id: 1, note_id: 1, title: 1, date_started: 1 }
  );

  console.log('foundConv from match search ', targetConvo);

  if (!targetConvo) {
    targetConvo = await createConversation(currentUser._id, currentNote._id);
  }

  if (!targetConvo) {
    throw new Error(
      `There was an error creating a new conversation for User ${currentUser._id} Note ${noteID}. Try again later.`
    );
  }

  return (
    <ClientUI
      convo={targetConvo}
      currentNote={currentNote}
      currentUser={currentUser}
    />
  );
}
