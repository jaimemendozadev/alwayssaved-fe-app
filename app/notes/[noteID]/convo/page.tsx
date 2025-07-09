'use server';
import { getUserFromDB } from '@/actions';
import { getActiveUserConvos } from '@/actions/schemamodels/conversations';
import { ReactNode } from 'react';
export default async function ConvoPage({
  params
}: {
  params: { noteID: string };
}): Promise<ReactNode> {
  const currentUser = await getUserFromDB();


  const { noteID } = await params;




  if(!noteID || !currentUser) {
    throw new Error(`There was a problem getting the Convos for Note ${noteID}. Try again later.`);
  }

  console.log("noteID in ConvoIDPage ", noteID);

  console.log("currentUser in ConvoIDPage ", currentUser);

  await getActiveUserConvos(currentUser._id, noteID)


  

  

  return <h1>ConvoPage</h1>
}
