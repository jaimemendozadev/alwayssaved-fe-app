'use client';
import { useState, ReactNode, createContext, useEffect } from 'react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { getUserFromDB } from '@/actions';
import {
  handleFileDeletion,
  handleNoteDeletion,
  handlePresignedUrls,
  createNoteDocument,
  createFileDocuments,
} from '@/actions/fileuploadcontext';
import { sendSQSMessage } from '@/utils/aws';
import { LeanUser } from '@/utils/mongodb';

const defaultNoteTitle = `Untitled Note - ${dayjs().format('MMMM D, YYYY')}`;
const basicErrorMsg = 'There was an error uploading your files, try again later.';
const feedbackDuration = { duration: 3000 };

import { verifyProcessUploadResults } from '@/components/fileupload/utils';


import { filterCurrentFiles, handleS3FileUploads } from './utils';



interface FileUploadContext {
  inFlight: boolean;
}

export const FileUploadContext = createContext({});


export const FileUploadProvider = ({
  children
}: {
  children: ReactNode;
}): ReactNode => {

  const [noteTitle, setNoteTitle] = useState(defaultNoteTitle);
  const [currentUser, setCurrentUser] = useState<LeanUser | null>(null);

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

    if(!currentUser) return;
    
    const currentUserID = currentUser._id;

    // 1) Create a Note document.
    const createdNote = await createNoteDocument(currentUserID, noteTitle);

    if (!createdNote) {
      toast.error(basicErrorMsg, feedbackDuration);
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

      toast.error(basicErrorMsg, feedbackDuration);
      return;
    }

    // 2a) If some of the File documents failed to be created, filter the acceptedFiles.
    if (createdFiles.length !== currentFiles.length) {
      currentFiles = filterCurrentFiles(currentFiles, createdFiles);
      toast.error(
        'There was a problem uploading some of your files, try again later.',
        feedbackDuration
      );
    }

    // 3) Create the presignUrls for each File document.
    const presignPayloads = await handlePresignedUrls(createdFiles);

    // 3a) If some or all of the presignURLs failed to be created, take the appropriate steps.
    if (presignPayloads.length === 0) {
      await handleNoteDeletion(createdNote);

      if (createdFiles.length > 0) {
        const fileIDs = createdFiles.map((file) => file._id);
        await handleFileDeletion(fileIDs);
      }

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
    <FileUploadContext.Provider value={}>{children}</FileUploadContext.Provider>
  );
};
