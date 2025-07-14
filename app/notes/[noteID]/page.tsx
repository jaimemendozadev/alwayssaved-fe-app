'use server';
import { ReactNode } from 'react';
import { getUserFromDB } from '@/actions';
import { getNoteByID } from '@/actions/schemamodels/notes';
import { matchProjectFiles } from '@/actions/schemamodels/files';
import { ClientUI } from '@/components/notes/[noteID]';
import { getObjectIDFromString } from '@/utils/mongodb';
import { matchProjectConversations } from '@/actions/schemamodels/conversations';
export default async function NoteIDPage({
  params
}: {
  params: { noteID: string };
}): Promise<ReactNode> {
  const { noteID } = await params;

  const currentNote = await getNoteByID(noteID);

  const currentUser = await getUserFromDB();

  if (!currentNote || !currentUser) {
    throw new Error(
      `There was a problem getting the Note Page for Note ${noteID}`
    );
  }

  const noteFiles = await matchProjectFiles(
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

  const activeConvos = await matchProjectConversations(
    {
      user_id: getObjectIDFromString(currentUser._id),
      note_id: getObjectIDFromString(currentNote._id),
      date_deleted: { $eq: null },
      date_archived: { $eq: null }
    },
    { _id: 1, user_id: 1, note_id: 1, title: 1, date_started: 1 }
  );

  if (currentUser && currentNote && noteFiles) {
    return (
      <ClientUI
        currentUser={currentUser}
        currentNote={currentNote}
        noteFiles={noteFiles}
        convos={activeConvos}
      />
    );
  }
  throw new Error(`There was an error displaying the Note Page for ${noteID}`);
}
