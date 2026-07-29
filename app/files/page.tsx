'use server';
import { ReactNode } from 'react';
import { Spinner } from '@heroui/react';
import { ClientUI } from '@/components/files';
import { getUserFromDB } from '@/actions';
import { getFilesBy } from '@/actions/schemamodels/files';
import { getObjectIDFromString } from '@/utils/mongodb';

/*
  7-26-26 TODO: 
    - For v1, display .txt files.
    - Display other file types when Subscriptions are implemented.
  
*/
export default async function FilesPage(): Promise<ReactNode> {
  const currentUser = await getUserFromDB();

  console.log('currentUser in FilesPage ', currentUser);
  console.log('\n');

  if (!currentUser) {
    return (
      <div className="p-6 w-[85%]">
        <div className="w-auto h-screen flex justify-center">
          <Spinner />
        </div>
      </div>
    );
  }

  const filter = {
    user_id: getObjectIDFromString(currentUser._id),
    file_type: '.txt',
    date_deleted: { $eq: null }
  };

  const transcripts = await getFilesBy(filter);

  console.log('transcripts ', transcripts);

  return <ClientUI currentUser={currentUser} userFiles={transcripts} />;
}
