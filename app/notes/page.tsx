'use client';
import { useEffect, useState, ReactNode } from 'react';
import { getUserFromDB } from '@/actions';
import { LeanUser, LeanNote } from '@/utils/mongodb';
import { getNotesByFields } from '@/actions/schemamodels/notes';

export default function NotesPage(): ReactNode {
  const [currentUser, setCurrentUser] = useState<LeanUser | null>(null);
  const [appNotes, setAppNotes] = useState<LeanNote[] | null>(null);

  console.log('currentUser in NotePage ', currentUser);
  console.log('appNotes in NotesPage ', appNotes);
  console.log('\n');

  useEffect(() => {
    async function loadPageData() {
      const currentUser = await getUserFromDB();

      if (currentUser) {
        setCurrentUser(currentUser);

        const userNotes = await getNotesByFields(currentUser._id, {
          _id: 0,
          title: 0,
          date_created: 0
        });

        setAppNotes(userNotes);
        return;
      }
    }

    loadPageData();
  }, []);

  return (
    <main className="p-6 w-[85%]">
      <h1 className="text-3xl lg:text-6xl mb-16">Your App Notes</h1>
    </main>
  );
}
