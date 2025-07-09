'use server';
import { getUserFromDB } from '@/actions';
import { getActiveUserConvos } from '@/actions/schemamodels/conversations';
import { matchProjectFiles } from '@/actions/schemamodels/files';
import { getObjectIDFromString } from '@/utils/mongodb';
import { ReactNode } from 'react';
export default async function ConvoIDPage({
  params
}: {
  params: { noteID: string };
}): Promise<ReactNode> {
  const currentUser = await getUserFromDB();


  const { noteID } = await params;




  if(!noteID || !currentUser) {
    throw new Error(`There was a problem getting the Convos for Note ${noteID}. Try again later.`);
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

  console.log("noteID in ConvoIDPage ", noteID);

  console.log("currentUser in ConvoIDPage ", currentUser);

  await getActiveUserConvos(currentUser._id, noteID)


  

  

  return <h1>ConvoIDPage</h1>
}
