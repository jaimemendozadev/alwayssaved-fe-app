'use client';
import { Dispatch, ReactNode, SetStateAction, useState } from 'react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { InputEvent } from '@/utils/ts';
import { LeanNote, LeanUser } from '@/utils/mongodb';

import { SubmitEvent } from '@/utils/ts';
import { updateNoteByID } from '@/actions/schemamodels/notes';
import { createNoteDocument } from './utils';

const defaultNoteTitle = `Untitled Note - ${dayjs().format('MMMM D, YYYY')}`;

const basicErrorMsg =
  'There was an error uploading your files, try again later.';

const feedbackDuration = { duration: 3000 };

interface NoteFormProps {
  currentUser: null | LeanUser;
  currentNote: null | LeanNote;
  inFlight: boolean;
  setNoteState: Dispatch<SetStateAction<LeanNote | null>>;
}

export const NoteForm = ({
  currentUser,
  currentNote,
  inFlight,
  setNoteState
}: NoteFormProps): ReactNode => {
  const [noteTitle, setNoteTitle] = useState(() =>
    currentNote
      ? currentNote.title
      : `Untitled Note - ${dayjs().format('dddd, MMMM D, YYYY h:mm A')}`
  );

  console.log('currentNote in NoteForm ', currentNote);

  const handleChange = (evt: InputEvent) => {
    if (!setNoteTitle) return;

    if (evt?.type === 'focus') {
      if (noteTitle === defaultNoteTitle) {
        setNoteTitle('');
        return;
      }
    }

    if (evt?.type === 'blur') {
      if (noteTitle.length === 0) {
        setNoteTitle(defaultNoteTitle);
        return;
      }
    }

    if (evt?.type === 'change') {
      setNoteTitle(evt.target.value);
      return;
    }
  };

  const handleSubmit = async (evt: SubmitEvent): Promise<void> => {
    evt.preventDefault();

    if (!currentUser) return;

    if (!currentNote) {
      const newNote = await createNoteDocument(currentUser._id, noteTitle);

      if (newNote) {
        setNoteState(newNote);
        return;
      }
    }

    if (currentNote) {
      await updateNoteByID(currentNote?._id, { title: noteTitle });
    }

    // toast.success('Your Note title has been update.', feedbackDuration);
  };

  if (!currentUser) return null;

  return (
    <form onSubmit={handleSubmit} className="mb-8 border-2 p-4">
      <label htmlFor="noteTitle" className="text-lg">
        <span className="font-bold">Note Name</span>:<br />
        <input
          className="w-[100%] p-3"
          onBlur={handleChange}
          onFocus={handleChange}
          onChange={handleChange}
          id="noteTitle"
          value={noteTitle}
          disabled={inFlight}
        />
      </label>
    </form>
  );
};

/*
  TODO Dev Notes:

  - Add router.refresh() after uploading the files? 🤔

  - If you have multiple long format videos (> 15 minutes), it will take a long time to
    upload all the files to s3. Need feedback to tell user to wait.

  - Should we delete the Note if all the processFile operations failed? 🤔

*/
