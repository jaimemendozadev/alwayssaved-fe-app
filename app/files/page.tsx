'use server';
import { ReactNode } from 'react';
import { Spinner } from '@heroui/react';
import { ClientUI } from '@/components/files';
import { getUserFromDB } from '@/actions';
import { matchProjectFiles } from '@/actions/schemamodels/files';
import { getObjectIDFromString } from '@/utils/mongodb';

export default async function FilesPage(): Promise<ReactNode> {
  const currentUser = await getUserFromDB();

  if (!currentUser) {
    return (
      <div className="p-6 w-[85%]">
        <div className="w-auto h-screen flex justify-center">
          <Spinner />
        </div>
      </div>
    );
  }

  const pipeline = [
    {
      $match: {
        user_id: getObjectIDFromString(currentUser._id),
        file_type: { $eq: '.txt' },
        date_deleted: { $eq: null }
      }
    },
    {
      $lookup: {
        from: 'notes',
        localField: 'note_id',
        foreignField: '_id',
        as: 'note_id'
      }
    },
    { $unwind: '$note_id' },
    {
      $project: {
        _id: 1,
        note_id: 1,
        file_name: 1,
        file_type: 1,
        date_uploaded: 1
      }
    }
  ];

  const transcripts = await matchProjectFiles(pipeline);

  return <ClientUI currentUser={currentUser} userFiles={transcripts} />;
}

/********************************************
 * Notes
 ********************************************

  1) 7-26-26 TODO: 
    - For v1, display .txt files.
    - Display other file types when Subscriptions are implemented.

  2) Should we use matchProjectFiles to get Files so you can also 
     project/display the Convo Name that the File is attached to?
  
*/
