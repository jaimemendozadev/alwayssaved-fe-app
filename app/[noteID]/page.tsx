'use client';
import { useEffect, useState, ReactNode } from 'react';
import { getUserFromDB } from '@/actions';
import { LeanUser, LeanNote } from '@/utils/mongodb';
export default function NotePage({ params }: { params: { noteID: string } }):ReactNode {
  const [currentUser, setCurrentUser] = useState<LeanUser | null>(null);
  const [currentNote, setCurrentNote] = useState<LeanNote | null>(null);



  useEffect(() => {
    async function loadCurrentUser() {
      const currentUser = await getUserFromDB();

      if (currentUser) {
        setCurrentUser(currentUser);
        return;
      }
    }

    loadCurrentUser();
  }, []);

  return (
    <main className="p-6 w-[85%]">
      <h1 className="text-3xl lg:text-6xl mb-16">
        Note Page for: {params.noteID}
      </h1>
      <FileUpload currentUser={currentUser} />
    </main>
  );
}
