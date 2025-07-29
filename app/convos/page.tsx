'use server';
import { ReactNode } from 'react';
import { getUserFromDB } from '@/actions';
import { ClientUI } from '@/components/notes/[noteID]';
import { getObjectIDFromString } from '@/utils/mongodb';
import { matchProjectConversations } from '@/actions/schemamodels/conversations';

export default async function ConvosPage(): Promise<ReactNode> {
  const currentUser = await getUserFromDB();

  if (!currentUser) {
    throw new Error(`There is no user authorized to access the app.`);
  }

  const activeConvos = await matchProjectConversations([
    {
      $match: {
        user_id: getObjectIDFromString(currentUser._id),
        date_deleted: { $eq: null },
        date_archived: { $eq: null }
      }
    },
    { $project: { _id: 1, user_id: 1, note_id: 1, title: 1, date_started: 1 } }
  ]);

  if (currentUser && activeConvos) {
    return <ClientUI currentUser={currentUser} convos={activeConvos} />;
  }
  throw new Error(`There was an error displaying the Convos Page.`);
}
