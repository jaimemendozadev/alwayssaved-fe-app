'use server';
import { getUserFromDB } from '@/actions';
import { matchProjectConversations } from '@/actions/schemamodels/conversations';
import { matchProjectNotes } from '@/actions/schemamodels/notes';
import { ClientUI } from '@/components/notes/[noteID]/convos';
import { getObjectIDFromString } from '@/utils/mongodb';
import { ReactNode } from 'react';
export default async function ConvoPage({
  params
}: {
  params: { noteID: string };
}): Promise<ReactNode> {
  const currentUser = await getUserFromDB();

  const { noteID } = await params;

  if (!noteID || !currentUser) {
    throw new Error(
      `There was a problem getting the Convos for Note ${noteID}. Try again later.`
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
      `There was a problem getting the Convos for Note ${noteID}. Try again later.`
    );
  }

  const activeConvos = await matchProjectConversations(
    {
      user_id: getObjectIDFromString(currentUser._id),
      note_id: getObjectIDFromString(currentNote._id),
      date_deleted: { $eq: null },
      date_archived: { $eq: null }
    },
    { _id: 1, user_id: 1, note_id: 1, title: 1, date_started: 1 }
  );

  return <ClientUI currentNote={currentNote} convos={activeConvos} />;
}
