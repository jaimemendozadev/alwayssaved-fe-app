'use client';
import { useState, ReactNode } from 'react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import Dropzone from 'react-dropzone';
import { LeanUser } from '@/utils/mongodb';
import { InputEvent } from '@/utils/ts';
import {
  handleFileDeletion,
  handleNoteDeletion,
  handlePresignedUrls
} from '@/actions/fileupload';
import { sendSQSMessage } from '@/utils/aws';
import {
  createNoteFileDocs,
  handleS3FileUploads,
  verifyCreateNoteFileDocsResult,
  verifyUploadsUpdateFilesInDB
} from './utils';
interface FileUploadProps {
  currentUser: LeanUser | null;
}

const defaultNoteTitle = `Untitled Note - ${dayjs().format('MMMM D, YYYY')}`;
const feedbackDuration = { duration: 3000 };

export const FileUpload = ({ currentUser }: FileUploadProps): ReactNode => {
  console.log('currentUser in FileUpload: ', currentUser);

  const [noteTitle, setNoteTitle] = useState(defaultNoteTitle);

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

  const handleUpload = async <T extends File>(acceptedFiles: T[]) => {
    console.log('acceptedFiles ', acceptedFiles);
    console.log('\n');

    let currentFiles = [...acceptedFiles];

    const currentUserID = currentUser._id;

    const fileInfoArray = currentFiles.map((file) => ({
      name: file.name,
      type: file.type
    }));

    // 1) Create a Note Doc and all File Docs associated with that Note.
    const noteFileDBResult = await createNoteFileDocs({
      fileInfoArray,
      currentUserID,
      noteTitle
    });

    console.log('noteFileDBResult before Validation: ', noteFileDBResult);

    console.log(
      'fileInfoArray before verifyCreateNoteFileDocsResult ',
      fileInfoArray
    );

    /*
      2) Verify the DB documents were created and only cancel file uploads to s3 if
         the Note document wasn't created or if all the File documents were not created.
         Return the fileInfo objects with names matching the File document names that were
         successfully saved in the db.
    */
    const validationCheck = await verifyCreateNoteFileDocsResult(
      noteFileDBResult,
      fileInfoArray
    );

    console.log(
      'validationCheck after verifyCreateNoteFileDocsResult ',
      validationCheck
    );

    if (validationCheck.message.length > 0) {
      const { message } = validationCheck;

      if (validationCheck.continue === false) {
        toast.error(message, feedbackDuration);
        return;
      }

      toast(message, feedbackDuration);
    }

    const { noteFileResult, verifiedFiles } = validationCheck;

    /* 
      3) Filter the currentFiles that will be uploaded to s3 because 
         they have corresponding File documents created in the db.
    */
    const verifiedFileNames = verifiedFiles.map((fileInfo) => fileInfo.name);
    currentFiles = currentFiles.filter((file) =>
      verifiedFileNames.includes(file.name)
    );

    const { fileDBResults, newNote } = noteFileResult;

    console.log('fileDBResults before handlePresignUrls ', fileDBResults);

    const [pluckedNote] = newNote;

    const createPresignStart = performance.now();

    // 4) Create the presignUrls for each File document.
    const s3PayloadResults = await handlePresignedUrls(fileDBResults);

    const createPresignEnd = performance.now();

    console.log("Time to create presignUrls in ms: ", createPresignEnd - createPresignStart);

    console.log('s3PayloadResults ', s3PayloadResults);

    if (s3PayloadResults.length === 0) {
      const fileIDs = fileDBResults.map((leanFile) => leanFile._id);

      await handleFileDeletion(fileIDs);

      await handleNoteDeletion(pluckedNote);

      toast.error(
        'There was a problem uploading your files to the cloud. Try again later.',
        feedbackDuration
      );
      return;
    }

    const uploadStart = performance.now();

    // 5) Upload each media file to s3.
    const finalizedUploadResults = await handleS3FileUploads(
      currentFiles,
      s3PayloadResults
    );

    const uploadEnd = performance.now();

    console.log("Time to upload files to s3 in ms: ", uploadEnd - uploadStart);
    console.log("finalizedUploadResults ", finalizedUploadResults);

    /*
      6) Verify media uploads were successful, perform database updates to each 
         File document with their s3_key, prep sqsPayload for sending SQS message.
    */
    const feedback = await verifyUploadsUpdateFilesInDB(
      finalizedUploadResults,
      s3PayloadResults,
      pluckedNote
    );

    console.log('feedback ', feedback);

    if (feedback.error) {
      toast.error(feedback.message, feedbackDuration);
      return;
    }

    console.log("SHOULD FIRE TOAST");
    toast.success(feedback.message, feedbackDuration);

    const sqs_message = {
      user_id: currentUserID,
      media_uploads: feedback.sqsPayload
    };

    // 7) Send SQS Message to EXTRACTOR_PUSH_QUEUE to Kick-Off ML Pipeline.
    // await sendSQSMessage(sqs_message);
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