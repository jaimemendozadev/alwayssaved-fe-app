'use server';
import { ReactNode } from 'react';
import { getUserFromDB } from '@/actions';
import { ClientUI } from '@/components/notes/[noteID]/edit';
import { getObjectIDFromString } from '@/utils/mongodb';
import { matchProjectNotes } from '@/actions/schemamodels/notes';
import { matchProjectFiles } from '@/actions/schemamodels/files';
import { matchProjectConversations } from '@/actions/schemamodels/conversations';

type Params = Promise<{ noteID: string }>;

export default async function NoteEditPage({
  params
}: {
  params: Params;
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

  // See Dev Note #1 below.
  const textFiles = await matchProjectFiles([
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
        s3_key: 1,
        file_name: 1,
        file_type: 1,
        date_deleted: 1
      }
    }
  ]);

  const activeConvos = await matchProjectConversations([
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

  return (
    <ClientUI
      currentUser={currentUser}
      currentNote={currentNote}
      noteFiles={textFiles}
      currentNoteID={noteID}
      convos={activeConvos}
    />
  );
}

/***************************
 * Notes
 ***************************

 1) For MVP v1, only rendering .txt files.
    If there's time to implement paid tiered
    users, access to .mp4 & .mp3 files will
    be for higher subscription paying users.
*/
