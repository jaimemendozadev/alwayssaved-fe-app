'use client';
import { ReactNode, useState, useEffect } from 'react';
import { LeanNote, LeanUser } from '@/utils/mongodb';

import { Uploader } from './uploader';
import { NoteForm } from './noteform';

interface FileUploadProps {
  currentUser: null | LeanUser;
  currentNote: null | LeanNote;
}

export const FileUpload = ({
  currentUser,
  currentNote
}: FileUploadProps): ReactNode => {
  const [localNote, setLocalNote] = useState<LeanNote | null>(null);

  useEffect(() => {
    if (currentNote) {
      setLocalNote(currentNote);
    }
  }, [currentNote]);

  if (!currentUser) return null;

  return (
    <div className="w-[900px]">
      <NoteForm currentUser={currentUser} currentNote={localNote} />

      <Uploader currentUser={currentUser} currentNote={localNote} />
    </div>
  );
};

/*
  TODO Dev Notes:

  - Add router.refresh() after uploading the files? 🤔

  - If you have multiple long format videos (> 15 minutes), it will take a long time to
    upload all the files to s3. Need feedback to tell user to wait.

  - Should we delete the Note if all the processFile operations failed? 🤔

*/
