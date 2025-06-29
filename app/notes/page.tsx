'use client';
import { useEffect, useState, ReactNode } from 'react';
import Link from 'next/link';
import { Spinner } from '@heroui/react';
import { getUserFromDB } from '@/actions';
import { LeanUser, LeanNote } from '@/utils/mongodb';
import { getNotesByFields } from '@/actions/schemamodels/notes';

export default function NotesPage(): ReactNode {
  const [currentUser, setCurrentUser] = useState<LeanUser | null>(null);
  const [appNotes, setAppNotes] = useState<LeanNote[]>([]);

  console.log('currentUser in NotePage ', currentUser);
  console.log('appNotes in NotesPage ', appNotes);
  console.log('\n');

  useEffect(() => {
    async function loadPageData() {
      const currentUser = await getUserFromDB();

      if (currentUser) {
        setCurrentUser(currentUser);

        const userNotes = await getNotesByFields(currentUser._id, {
          _id: 1,
          title: 1,
          date_created: 1
        });

        setAppNotes(userNotes);
        return;
      }

      throw new Error('User is not logged into app.');
    }

    loadPageData();
  }, []);

  if (!currentUser) {
    return (
      <main className="p-6 w-[85%]">
        <div className="w-aut h-screen flex justify-center">
          <Spinner />
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 w-[85%]">
      <h1 className="text-3xl lg:text-6xl mb-16">
        {currentUser?.first_name}&#39;s Notes
      </h1>

      {appNotes.length === 0 && (
        <p className="text-2xl">
          You have no notes saved in the app. Go upload some files and{' '}
          <Link
            className="hover:underline underline-offset-4 text-blue-700"
            href="/home"
          >
            create a new note
          </Link>
          .
        </p>
      )}
      {appNotes.length > 0 &&
        appNotes.map((noteDoc) => {
          console.log('noteDoc ', noteDoc);
          return (
            <Link key={noteDoc._id} href={`/notes/${noteDoc._id}`}>
              {noteDoc.title}
            </Link>
          );
        })}
    </main>
  );
}
