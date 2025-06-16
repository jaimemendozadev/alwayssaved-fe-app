'use client';
import {
  useState,
  ReactNode,
  createContext,
  useEffect,
  Dispatch,
  SetStateAction
} from 'react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { getUserFromDB } from '@/actions';

import {
  filterCurrentFiles,
  handleS3FileUploads,
  verifyProcessUploadResults,
  handleFileDeletion,
  handleNoteDeletion,
  handlePresignedUrls,
  createNoteDocument,
  createFileDocuments
} from './utils';

import { sendSQSMessage } from '@/utils/aws';
import { LeanUser } from '@/utils/mongodb';

const basicErrorMsg =
  'There was an error uploading your files, try again later.';
const feedbackDuration = { duration: 3000 };

interface FileUploadContext {
  inFlight: boolean;
  noteTitle: string;
  progressValue: number;
  setNoteTitle?: Dispatch<SetStateAction<string>>;
  handleUpload?: <T extends File>(acceptedFiles: T[]) => void;
}

export const FileUploadContext = createContext<FileUploadContext>({
  inFlight: false,
  noteTitle: '',
  progressValue: 0
});

export const FileUploadProvider = ({
  children
}: {
  children: ReactNode;
}): ReactNode => {
  const [inFlight, setFlightStatus] = useState(false);
  const [noteTitle, setNoteTitle] = useState(
    `Untitled Note - ${dayjs().format('dddd, MMMM D, YYYY h:mm A')}`
  );
  const [currentUser, setCurrentUser] = useState<LeanUser | null>(null);

  const [progressValue, updateProgress] = useState(0);

  useEffect(() => {
    async function loadCurrentUser() {
      const currentUser = await getUserFromDB();

      if (currentUser) {
        setCurrentUser(currentUser);
        return;
      }

      // QUESTION: If an error is throw in the context, where can it be caught?
    }

    loadCurrentUser();
  }, []);

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
        'There was a problem uploading some of your files, try again later.',
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
    const uploadResults = await handleS3FileUploads(
      currentFiles,
      presignPayloads
    );

    await Promise.allSettled(
      currentFiles.map(async (file) => {
        const targetName = file.name;

        const [targetPayload] = presignPayloads.filter(
          (s3Payload) => s3Payload.file_name === targetName
        );
      })
    );

    updateProgress(60);

    /* 
        5) Verify media uploads were successful, perform database updates to each 
         File document with their s3_key, prep sqsPayload for sending SQS message.
      */

    const feedback = await verifyProcessUploadResults(
      uploadResults,
      presignPayloads,
      createdNote
    );

    updateProgress(80);

    if (feedback.error) {
      setFlightStatus(false);
      updateProgress(0);
      toast.error(feedback.message, feedbackDuration);
      return;
    }

    updateProgress(90);

    toast.success(feedback.message, feedbackDuration);

    const sqs_message = {
      user_id: currentUserID,
      media_uploads: feedback.sqsPayload
    };

    // 6) Send SQS Message to EXTRACTOR_PUSH_QUEUE to Kick-Off ML Pipeline.
    await sendSQSMessage(sqs_message);

    updateProgress(100);

    setFlightStatus(false);

    updateProgress(0);

    setNoteTitle(
      `Untitled Note - ${dayjs().format('dddd, MMMM D, YYYY h:mm A')}`
    ); // TODO: May have to play around with this if the user
  };

  return (
    <FileUploadContext.Provider
      value={{ inFlight, handleUpload, noteTitle, setNoteTitle, progressValue }}
    >
      {children}
    </FileUploadContext.Provider>
  );
};
