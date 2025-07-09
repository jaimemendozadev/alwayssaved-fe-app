'use server';
import { ReactNode } from 'react';
import { getUserFromDB } from '@/actions';
import { getNoteByID } from '@/actions/schemamodels/notes';
import { matchProjectFiles } from '@/actions/schemamodels/files';
import { NumberNoteMainUI } from '@/components/[noteID]';
import { getObjectIDFromString } from '@/utils/mongodb';
export default async function ConvoIDPage({
  params
}: {
  params: { noteID: string };
}): Promise<ReactNode> {
  const { noteID, convoID } = await params;

  console.log("noteID in ConvoIDPage ", noteID);
  console.log("convoID in ConvoIDPage ", convoID);

  return <h1>ConvoIDPage</h1>
}
