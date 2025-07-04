'use client';
import { ReactNode } from 'react';
import Link from 'next/link';
import { LeanUser, LeanNote, LeanFile } from '@/utils/mongodb';
interface NumberNoteMainUIProps {
  currentUser: LeanUser;
  currentNote: LeanNote;
  noteFiles: LeanFile[];
}

export const NumberNoteMainUI = ({
  currentUser,
  currentNote,
  noteFiles
}: NumberNoteMainUIProps): ReactNode => {
  console.log('currentUser in NumberNoteMainUI ', currentUser);

  return (
    <main className="p-6 w-[85%]">
      <h1 className="text-3xl lg:text-6xl mb-16">
        Note Page for: {currentNote?.title}
      </h1>

      <p className="mb-14">
        <Link
          className="hover:underline underline-offset-4"
          href={`${currentNote._id.toString()}/edit`}
        >
          ✍🏼 Edit Your Note
        </Link>
      </p>

      <h2 className="text-3xl lg:text-4xl mb-6">Files Attached to Your Note</h2>

      {noteFiles.length > 0 && (
        <ul className="space-y-4 mb-20">
          {noteFiles.map((fileDoc) => (
            <li key={fileDoc._id} className="border p-5">
              <span className="font-semibold">File Name</span>:{' '}
              {fileDoc.file_name} &nbsp; | &nbsp;{' '}
              <span className="font-semibold">File Type</span>:{' '}
              {fileDoc.file_type}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};
