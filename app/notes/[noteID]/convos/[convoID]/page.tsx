'use server';
import { ReactNode } from 'react';
import { getUserFromDB } from '@/actions';
import { ClientUI } from '@/components/notes/[noteID]/convos/[convoID]';
import { getNoteByID } from '@/actions/schemamodels/notes';
import { matchProjectConversations } from '@/actions/schemamodels/conversations';
import { getObjectIDFromString } from '@/utils/mongodb';
import { matchProjectFiles } from '@/actions/schemamodels/files';

type Params = Promise<{ noteID: string; convoID: string }>;

export default async function ConvoIDPage({
  params
}: {
  params: Params;
}): Promise<ReactNode> {
  const currentUser = await getUserFromDB();
  const { noteID, convoID } = await params;

  if (!currentUser || !noteID || !convoID) {
    throw new Error(
      `There was an error getting the Conversation ${convoID} for Note ${noteID}. Try again later.`
    );
  }

  const currentNote = await getNoteByID(noteID);

  if (!currentNote) {
    throw new Error(
      `There was an error getting the Conversation ${convoID} for User ${currentUser._id} Note ${noteID}. Try again later.`
    );
  }

  const [targetConvo] = await matchProjectConversations([
    {
      $match: {
        user_id: getObjectIDFromString(currentUser._id),
        note_id: getObjectIDFromString(currentNote._id),
        date_deleted: { $eq: null },
        date_archived: { $eq: null }
      }
    },
    { $project: { _id: 1, user_id: 1, note_id: 1, title: 1, date_started: 1 } }
  ]);

  if (!targetConvo) {
    throw new Error(
      `There was an error getting the Conversation ${convoID} for User ${currentUser._id} Note ${noteID}. Try again later.`
    );
  }

  const convoFiles = await matchProjectFiles([
    {
      $match: {
        user_id: getObjectIDFromString(currentUser._id),
        note_id: getObjectIDFromString(currentNote._id),
        file_type: { $eq: '.txt' },
        date_deleted: { $eq: null }
      }
    },
    {
      $project: {
        _id: 1,
        file_name: 1
      }
    }
  ]);

  return (
    <ClientUI
      convo={targetConvo}
      currentUser={currentUser}
      currentNote={currentNote}
      convoFiles={convoFiles}
    />
  );
}
