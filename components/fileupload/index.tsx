'use client';
import { ReactNode, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { LeanNote, LeanUser } from '@/utils/mongodb';

import { Uploader } from './uploader';
import { NoteForm } from './noteform';
import { getNoteByID } from '@/actions/schemamodels/notes';

interface FileUploadProps {
  currentUser: null | LeanUser;
  currentNoteID: null | string;
}

// TODO: Fix resetting NoteForm when successful file upload occurs.

const getDefaultNoteTitle = () =>
  `Untitled Note - ${dayjs().format('dddd, MMMM D, YYYY h:mm A')}`;

export const FileUpload = ({
  currentUser,
  currentNoteID
}: FileUploadProps): ReactNode => {
  const [defaultTitle, setDefaultTitle] = useState('');
  const [localNote, setLocalNote] = useState<LeanNote | null>(null);
  const [inFlight, setFlightStatus] = useState(false);

  useEffect(() => {
    async function getTargetNote(targetNoteID: string): Promise<void> {
      const foundNote = await getNoteByID(targetNoteID);

      if (foundNote) {
        setLocalNote(foundNote);
        setDefaultTitle(foundNote.title);
        return;
      }

      throw new Error(
        `Could not find the Note with noteID ${targetNoteID} to perform FileUpload update.`
      );
    }
    if (currentNoteID) {
      getTargetNote(currentNoteID);
      return;
    }

    const newTitle = getDefaultNoteTitle();
    setDefaultTitle(newTitle);
  }, [currentNoteID]);

  if (!currentUser) return null;

  return (
    <div className="w-[900px]">
      <NoteForm
        currentUser={currentUser}
        localNote={localNote}
        setLocalNote={setLocalNote}
        defaultTitle={defaultTitle}
        inFlight={inFlight}
      />

      <Uploader
        currentUser={currentUser}
        currentNoteID={currentNoteID}
        localNote={localNote}
        setLocalNote={setLocalNote}
        inFlight={inFlight}
        setFlightStatus={setFlightStatus}
      />
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
