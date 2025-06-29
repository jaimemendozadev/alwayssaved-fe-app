'use client';
import { ReactNode } from 'react';
import { LeanUser, LeanNote } from '@/utils/mongodb';

interface NumberNoteMainUIProps {
  currentUser: LeanUser;
  currentNote: LeanNote;
}

export const NumberNoteMainUI = ({
  currentUser,
  currentNote
}: NumberNoteMainUIProps): ReactNode => {
  console.log('currentUser in NumberNoteMainUI ', currentUser);

  return (
    <main className="p-6 w-[85%]">
      <h1 className="text-3xl lg:text-6xl mb-16">
        Note Page for: {currentNote?.title}
      </h1>

      <h2 className="text-2xl lg:text-6xl mb-16">Note Files</h2>
    </main>
  );
};
