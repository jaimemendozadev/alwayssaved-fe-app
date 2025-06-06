'use client';
import dayjs from 'dayjs';
import Dropzone from 'react-dropzone';
import { LeanUser } from '@/utils/mongodb';
import { InputEvent } from '@/utils/ts';


import {
  createFileDocuments,
  createNoteDocument,
  handleS3FileUploads,
  verifyProcessUploadResults
} from './utils';

interface FileUploadProps {
  currentUser: LeanUser | null;
}

const defaultNoteTitle = `Untitled Note - ${dayjs().format('MMMM D, YYYY')}`;


export const FileUpload = ({ currentUser }: FileUploadProps): ReactNode => {
  console.log('currentUser in FileUpload: ', currentUser);


  if (!currentUser) return null;

  const handleChange = (evt: InputEvent) => {
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


  return (
    <div className="w-[900px]">
      <article className="mb-16">
        <p className="text-xl">
          <span className="font-bold">Media Upload Instructions</span>:
        </p>
        <p className="text-lg">
          Create a new Note by giving your note a new name AND adding media
          files to your note for transcribing.
        </p>
        <p className="text-lg">
          Wait until all the media files are uploaded to the cloud for
          transcribing. Then you can create a new Note with new media files.
        </p>
        <p className="text-lg">
          While you wait for the media files to be transcribed, go do something
          else. We&apos;ll let you know when it&apos;s done.
        </p>
      </article>

      <form className="mb-8 border-2 p-4">
        <label htmlFor="noteTitle" className="text-lg">
          <span className="font-bold">Your New Note Name</span>:<br />
          <input
            className="w-[100%]"
            onBlur={handleChange}
            onFocus={handleChange}
            onChange={handleChange}
            id="noteTitle"
            value={noteTitle}
          />
        </label>
      </form>

      <Dropzone onDrop={(acceptedFiles) => handleUpload(acceptedFiles)}>
        {({ getRootProps, getInputProps }) => (
          <section className="border-4 border-dashed p-10">
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <p>Drag and drop some files here, or click to select files</p>
            </div>
          </section>
        )}
      </Dropzone>
    </div>
  );
};

/*
  TODO Dev Notes:

  - If you have multiple long format videos (> 15 minutes), it will take a long time to
    upload all the files to s3. Need feedback to tell user to wait.

  - Address issue on Backend to somehow delay processing incoming SQS message from Frontend
    because s3 videos might not be immediately available for processing.

*/
