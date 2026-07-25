'use server';
import { ReactNode } from 'react';
import { Spinner } from '@heroui/react';
import { getUserFromDB } from '@/actions';
import { matchProjectNotes } from '@/actions/schemamodels/notes';
import { ClientUI } from '@/components/notes';
import { getObjectIDFromString, LeanNote } from '@/utils/mongodb';
import { PipelineStage } from 'mongoose';

export default async function NotesPage(): Promise<ReactNode> {
  const currentUser = await getUserFromDB();
  let userNotes: LeanNote[] = [];

  if (currentUser) {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          user_id: getObjectIDFromString(currentUser._id),
          date_deleted: { $eq: null }
        }
      },
      { $project: { _id: 1, title: 1, date_created: 1 } },
      { $sort: { date_created: -1 } }
    ];

    const dbResult = await matchProjectNotes(pipeline);

    if (Array.isArray(dbResult)) {
      userNotes = dbResult;
    }
  }

  if (!currentUser) {
    return (
      <div className="p-6 w-[85%]">
        <div className="w-auto h-screen flex justify-center">
          <Spinner />
        </div>
      </div>
    );
  }

  return <ClientUI userNotes={userNotes} currentUser={currentUser} />;
}
