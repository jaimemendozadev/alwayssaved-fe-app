'use client';
import { ReactNode, useState, useEffect } from 'react';
import { LeanNote, LeanUser } from '@/utils/mongodb';

import { Uploader } from './uploader';
import { NoteForm } from './noteform';
import { getNoteByID } from '@/actions/schemamodels/notes';

interface FileUploadProps {
  currentUser: null | LeanUser;
  currentNoteID: null | string;
}

export const FileUpload = ({
  currentUser,
  currentNoteID
}: FileUploadProps): ReactNode => {
  const [localNote, setLocalNote] = useState<LeanNote | null>(null);
  const [inFlight, setFlightStatus] = useState(false);

  useEffect(() => {
    async function getTargetNote(targetNoteID: string): Promise<void> {
      const foundNote = await getNoteByID(targetNoteID);

      if (foundNote) {
        setLocalNote(foundNote);
      }
    }
    if (currentNoteID) {
      getTargetNote(currentNoteID);
    }
  }, [currentNoteID]);

  if (!currentUser) return null;

  return (
    <div className="w-[900px]">
      <NoteForm
        currentUser={currentUser}
        localNote={localNote}
        setLocalNote={setLocalNote}
        inFlight={inFlight}
      />

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
