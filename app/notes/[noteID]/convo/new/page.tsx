'use server';
import { ReactNode } from 'react';
import { getUserFromDB } from '@/actions';
export default async function NewConvoPage({
  params
}: {
  params: { noteID: string };
}): Promise<ReactNode> {
  const currentUser = await getUserFromDB();
  const { noteID } = await params;

  console.log('noteID in NewConvoPage ', noteID);

  if (!currentUser || !noteID) {
    throw new Error(
      `There was an error getting the NewConvoPage for Note ${noteID}. Try again later.`
    );
  }

  return <h1>New Convo Page</h1>;
}
