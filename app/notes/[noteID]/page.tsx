'use server';
import { ReactNode } from 'react';
import { getUserFromDB } from '@/actions';
import { getNoteByID } from '@/actions/schemamodels/notes';
import { matchProjectFiles } from '@/actions/schemamodels/files';
import { ClientUI } from '@/components/notes/[noteID]';
import { getObjectIDFromString } from '@/utils/mongodb';
export default async function NoteIDPage({
  params
}: {
  params: { noteID: string };
}): Promise<ReactNode> {
  const { noteID } = await params;

  const currentNote = await getNoteByID(noteID);

  const currentUser = await getUserFromDB();

  let noteFiles = null;

  if (currentNote && currentUser) {
    noteFiles = await matchProjectFiles(
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
  }

  if (currentNote && noteFiles) {
    return <ClientUI currentNote={currentNote} noteFiles={noteFiles} />;
  }
  throw new Error(`There was an error displaying the Note Page for ${noteID}`);
}
