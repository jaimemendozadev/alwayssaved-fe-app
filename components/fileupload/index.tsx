'use client';
import { ReactNode, useContext } from 'react';
import dayjs from 'dayjs';
import { Progress } from '@heroui/react';
import Dropzone from 'react-dropzone';
import { InputEvent } from '@/utils/ts';
import { FileUploadContext } from '@/utils/context/filteruploadcontext';

const defaultNoteTitle = `Untitled Note - ${dayjs().format('MMMM D, YYYY')}`;

export const FileUpload = (): ReactNode => {
  const { handleUpload, inFlight, setNoteTitle, noteTitle, progressValue } =
    useContext(FileUploadContext);

  console.log('inFlight in FileUpload ', inFlight);

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

  if (!handleUpload) return null;

  return (
    <div className="w-[900px]">
      <article className="mb-16">
        <p className="text-xl mb-2">
          <span className="font-bold">Media Upload Instructions</span>:
        </p>
        <p className="text-lg mb-3">
          Create a new Note by giving your note a new name AND adding media
          files to your note for transcribing.
        </p>
        <p className="text-lg mb-3">
          Wait until all the media files are uploaded to the cloud for
          transcribing. Then you can create a brand new Note with new media files.
        </p>

        <p className="text-lg mb-3">
          While you wait for the media files to be transcribed, go do something
          else. We&apos;ll let you know when it&apos;s done.
        </p>

        <p className="text-lg">
          You&apos;ll be able to navigate to other parts of the app and do other
          things while the upload process finishes. You just won&apos;t be able to upload
          new files until your current files have finished uploading.
        </p>


      </article>

      <div className="flex min-h-24 justify-center">
        {inFlight && (
          <Progress
            aria-label="Uploading..."
            label="Uploading..."
            className="max-w-md"
            color="success"
            showValueLabel={true}
            size="md"
            value={progressValue}
          />
        )}
      </div>

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
            disabled={inFlight}
          />
        </label>
      </form>

      <Dropzone
        disabled={inFlight}
        onDrop={(acceptedFiles) => handleUpload(acceptedFiles)}
      >
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
