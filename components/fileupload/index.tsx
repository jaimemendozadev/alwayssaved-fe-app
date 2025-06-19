'use client';
import { ReactNode, useState } from 'react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { Progress } from '@heroui/react';
import Dropzone from 'react-dropzone';
import { InputEvent } from '@/utils/ts';
import { LeanUser } from '@/utils/mongodb';

import {
  createNoteDocument,
  createFileDocuments,
  handleNoteDeletion,
  handleFileDeletion
} from '@/actions/fileupload';
import { handlePresignedUrls } from '@/actions/fileupload';
import { filterCurrentFiles } from '@/components/fileupload/utils';

import { processFile } from '@/components/fileupload/utils/processFile';

const defaultNoteTitle = `Untitled Note - ${dayjs().format('MMMM D, YYYY')}`;
const basicErrorMsg =
  'There was an error uploading your files, try again later.';
const feedbackDuration = { duration: 3000 };

interface FileUploadProps {
  currentUser: null | LeanUser;
}

export const FileUpload = ({ currentUser }: FileUploadProps): ReactNode => {
  const [inFlight, setFlightStatus] = useState(false);
  const [noteTitle, setNoteTitle] = useState(
    `Untitled Note - ${dayjs().format('dddd, MMMM D, YYYY h:mm A')}`
  );

  const [progressValue, updateProgress] = useState(0);

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

  const handleUpload = async <T extends File>(acceptedFiles: T[]) => {
    if (!currentUser) return;

    setFlightStatus(true);

    const currentUserID = currentUser._id;

    // 1) Create a Note document.
    updateProgress(1);
    const createdNote = await createNoteDocument(currentUserID, noteTitle);

    updateProgress(3);

    if (!createdNote) {
      setFlightStatus(false);
      updateProgress(0);
      toast.error(basicErrorMsg, feedbackDuration);
      return;
    }

    updateProgress(13);

    // 2) Create all the File documents associated with that Note.
    let currentFiles = [...acceptedFiles];

    const fileInfoArray = currentFiles.map((file) => ({
      name: file.name,
      type: file.type
    }));

    const createdFiles = await createFileDocuments(
      fileInfoArray,
      currentUserID,
      createdNote._id
    );

    updateProgress(20);

    if (createdFiles.length === 0) {
      await handleNoteDeletion(createdNote);

      setFlightStatus(false);

      updateProgress(0);

      toast.error(basicErrorMsg, feedbackDuration);
      return;
    }

    updateProgress(26);

    // 2a) If some of the File documents failed to be created, filter the acceptedFiles.
    if (createdFiles.length !== currentFiles.length) {
      currentFiles = filterCurrentFiles(currentFiles, createdFiles);
      toast.error(
        'There was a problem uploading some of your files, try saving those files again later.',
        feedbackDuration
      );
    }

    updateProgress(32);

    // 3) Create the presignUrls for each File document.
    const presignPayloads = await handlePresignedUrls(createdFiles);

    updateProgress(35);

    // 3a) If some or all of the presignURLs failed to be created, take the appropriate steps.
    if (presignPayloads.length === 0) {
      await handleNoteDeletion(createdNote);

      if (createdFiles.length > 0) {
        const fileIDs = createdFiles.map((file) => file._id);
        await handleFileDeletion(fileIDs);
      }

      setFlightStatus(false);
      updateProgress(0);

      toast.error(basicErrorMsg, feedbackDuration);
      return;
    }

    if (presignPayloads.length !== currentFiles.length) {
      currentFiles = filterCurrentFiles(currentFiles, presignPayloads);
      toast.error(
        'There was a problem uploading some of your files, try again later.',
        feedbackDuration
      );
    }

    updateProgress(38);

    // 4) Upload each media file to s3.
    // const uploadResults = await handleS3FileUploads(
    //   currentFiles,
    //   presignPayloads
    // );

    const uploadResuts = await Promise.allSettled(
      currentFiles.map(async (file) => {
        const targetName = file.name;

        const [targetPayload] = presignPayloads.filter(
          (s3Payload) => s3Payload.file_name === targetName
        );

        const status = await processFile(file, targetPayload);

        return status;
      })
    );

    updateProgress(75);

    uploadResuts.forEach((result) => {
      if (result.status === 'rejected') {
        // TODO: Handle in telemetry.
        console.error('Uploading file to s3 failed: ', result.reason);
      }
    });

    const successfulResults = uploadResuts.filter(
      (result) => result.status === 'fulfilled'
    );

    updateProgress(100);

    switch (successfulResults.length) {
      case 0: {
        toast.error(
          'There was a problem saving your files. Try again later.',
          feedbackDuration
        );
        break;
      }
      case currentFiles.length: {
        toast.success(
          'Your files were successfully uploaded.',
          feedbackDuration
        );
      }

      default: {
        toast.success(
          'Some but not all your files were saved. Try saving those files again later.',
          feedbackDuration
        );
      }
    }

    setFlightStatus(false);

    updateProgress(0);

    /* 
        5) Verify media uploads were successful, perform database updates to each 
         File document with their s3_key, prep sqsPayload for sending SQS message.
      */

    // const feedback = await verifyProcessUploadResults(
    //   uploadResults,
    //   presignPayloads,
    //   createdNote
    // );

    // updateProgress(80);

    // if (feedback.error) {
    //   setFlightStatus(false);
    //   updateProgress(0);
    //   toast.error(feedback.message, feedbackDuration);
    //   return;
    // }

    // updateProgress(90);

    // toast.success(feedback.message, feedbackDuration);

    // const sqs_message = {
    //   user_id: currentUserID,
    //   media_uploads: feedback.sqsPayload
    // };

    // 6) Send SQS Message to EXTRACTOR_PUSH_QUEUE to Kick-Off ML Pipeline.
    // await sendSQSMessage(sqs_message);

    // updateProgress(100);

    // setFlightStatus(false);

    // updateProgress(0);

    setNoteTitle(
      `Untitled Note - ${dayjs().format('dddd, MMMM D, YYYY h:mm A')}`
    ); // TODO: May have to play around with this if the user
  };

  if (!currentUser) return null;

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
          transcribing. Then you can create a brand new Note with new media
          files.
        </p>

        <p className="text-lg mb-3">
          While you wait for the media files to be transcribed, go do something
          else. We&apos;ll let you know when it&apos;s done.
        </p>

        <p className="text-lg">
          You&apos;ll be able to navigate to other parts of the app and do other
          things while the upload process finishes. You just won&apos;t be able
          to upload new files until your current files have finished uploading.
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
