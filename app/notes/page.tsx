'use server';
import { ReactNode } from 'react';
import { Spinner } from '@heroui/react';
import { getUserFromDB } from '@/actions';
import { getNotesByFields } from '@/actions/schemamodels/notes';
import { PageWrapper as NotesPageWrapper } from '@/components/notes';
import { LeanNote } from '@/utils/mongodb';

export default async function NotesPage(): Promise<ReactNode> {
  const currentUser = await getUserFromDB();
  let userNotes: LeanNote[] = [];

  if (currentUser) {
    const dbResult = await getNotesByFields(
      currentUser._id,
      {
        _id: 1,
        title: 1,
        date_created: 1
      },
      true
    );

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

  return <NotesPageWrapper userNotes={userNotes} currentUser={currentUser} />;
}
