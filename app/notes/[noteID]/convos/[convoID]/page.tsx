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

  // See Dev Note #1 below.
  const [currentConvo] = await matchProjectConversations([
    {
      $match: {
        _id: getObjectIDFromString(convoID),
        user_id: getObjectIDFromString(currentUser._id),
        note_id: getObjectIDFromString(currentNote._id),
        date_deleted: { $eq: null },
        date_archived: { $eq: null }
      }
    },
    { $project: { _id: 1, user_id: 1, note_id: 1, title: 1, date_started: 1 } }
  ]);

  if (!currentConvo) {
    throw new Error(
      `There was an error getting the Conversation ${convoID} for User ${currentUser._id} and the Note ${noteID}. Try again later.`
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

  if (convoFiles.length === 0) {
    throw new Error(
      `The Note ${noteID} for the conversation ${convoID} has no attached convo Files. Can't engage in a conversation without Files attached.`
    );
  }

  return (
    <ClientUI
      currentConvo={currentConvo}
      currentUser={currentUser}
      currentNote={currentNote}
      convoFiles={convoFiles}
    />
  );
}

/***************************
 * Notes
 ***************************

 1) 7-31-26 TODO: Need to reevaluate how ConvoMessages are recorded so
    that the chat order is correct. For v2, we want to create the ability
    for paid users to be able to download a .txt file of their chat convo.
    We need to make sure the ConvoMessage order is being correctly recorded
    so we can query the database to get all the convomessages for a chat and
    ensure the convomessage order is correct.
\
*/
