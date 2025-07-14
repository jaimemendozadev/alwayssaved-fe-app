'use server';
import { ReactNode } from 'react';
import { getUserFromDB } from '@/actions';
import { matchProjectFiles } from '@/actions/schemamodels/files';
import { getObjectIDFromString } from '@/utils/mongodb';
export default async function ConvoIDPage({
  params
}: {
  params: { noteID: string; convoID: string };
}): Promise<ReactNode> {
  const currentUser = await getUserFromDB();
  const { noteID, convoID } = await params;

  console.log('noteID in ConvoIDPage ', noteID);
  console.log('convoID in ConvoIDPage ', convoID);

  if (!currentUser || !noteID || !convoID) {
    throw new Error(
      `There was an error getting the Convo Page for Note ${noteID} Convo ${convoID}. Try again later.`
    );
  }

  const files = await matchProjectFiles(
    {
      user_id: getObjectIDFromString(currentUser._id),
      note_id: getObjectIDFromString(noteID),
      date_deleted: { $eq: null }
    },
    {
      _id: 1,
      s3_key: 1,
      file_name: 1,
      file_type: 1,
      date_deleted: 1
    }
  );

  console.log('files in ConvoIDPage ', files);

  // TODO: Move all content from app/notes/[noteID]/convos/new/page.tsx to this page

  return <h1>ConvoIDPage</h1>;
}
