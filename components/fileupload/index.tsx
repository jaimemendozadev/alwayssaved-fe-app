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
  handlePresignedUrls,
} from '@/actions/fileupload';
import { sendSQSMessage } from '@/utils/aws';
import {
  createFileDocuments,
  createNoteDocument,
  handleS3FileUploads,
  filterCurrentFiles,
  verifyProcessUploadResults
} from './utils';
interface FileUploadProps {
  currentUser: LeanUser | null;
}

const defaultNoteTitle = `Untitled Note - ${dayjs().format('MMMM D, YYYY')}`;
const basicErrorMsg = 'There was an error uploading your files, try again later.';
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

    const currentUserID = currentUser._id;

    // 1) Create a Note document.
    const createdNote = await createNoteDocument(currentUserID, noteTitle);

    if (!createdNote) {
      toast.error(
        basicErrorMsg,
        feedbackDuration
      );
      return;
    }

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

    if (createdFiles.length === 0) {

      await handleNoteDeletion(createdNote);

      toast.error(
        basicErrorMsg,
        feedbackDuration
      );
      return;
    }

 
    // 2a) If some of the File documents failed to be created, filter the acceptedFiles.
    if(createdFiles.length !== currentFiles.length) {
      currentFiles = filterCurrentFiles(currentFiles, createdFiles);
      toast.error("There was a problem uploading some of your files, try again later.", feedbackDuration);
    }


    // 3) Create the presignUrls for each File document.
    const presignPayloads = await handlePresignedUrls(createdFiles);


    // 3a) If some or all of the presignURLs failed to be created, take the appropriate steps.
    if(presignPayloads.length === 0) {
      await handleNoteDeletion(createdNote);

      if(createdFiles.length > 0) {
        const fileIDs = createdFiles.map(file => file._id);
        await handleFileDeletion(fileIDs);
      }

      toast.error(
        basicErrorMsg,
        feedbackDuration
      );
      return;

    }

    if(presignPayloads.length !== currentFiles.length) {
      currentFiles = filterCurrentFiles(currentFiles, presignPayloads);
      toast.error("There was a problem uploading some of your files, try again later.", feedbackDuration);
    }


    // 4) Upload each media file to s3.
    const uploadResults = await handleS3FileUploads(
      currentFiles,
      presignPayloads
    );

   
    /*
      5) Verify media uploads were successful, perform database updates to each 
         File document with their s3_key, prep sqsPayload for sending SQS message.
    */
    const feedback = await verifyProcessUploadResults(
      uploadResults,
      presignPayloads,
      createdNote
    );

    if (feedback.error) {
      toast.error(feedback.message, feedbackDuration);
      return;
    }

    toast.success(feedback.message, feedbackDuration);

    const sqs_message = {
      user_id: currentUserID,
      media_uploads: feedback.sqsPayload
    };

    // 6) Send SQS Message to EXTRACTOR_PUSH_QUEUE to Kick-Off ML Pipeline.
    await sendSQSMessage(sqs_message);
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
