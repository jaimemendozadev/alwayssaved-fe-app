'use client';
import { ReactNode } from 'react';
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

      <h2 className="text-3xl lg:text-4xl mb-6">Note Files</h2>

      {noteFiles.length === 0 && (
        <p className="text-xl">
          You have no files attached to this Note. You can add files to the note
          in the dropdown below.
        </p>
      )}

      {noteFiles.length > 0 && (
        <ul className="space-y-4">
          {noteFiles.map((fileDoc) => (
            <li key={fileDoc._id} className="border p-5">
              <span className="font-semibold">File Name</span>:{' '}
              {fileDoc.file_name} &nbsp; | &nbsp;{' '}
              <span className="font-semibold">File Type</span>:{' '}
              {fileDoc.file_type} &nbsp; | &nbsp; 🗑️
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};
