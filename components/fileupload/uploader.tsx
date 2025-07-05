'use client';
import { Dispatch, ReactNode, SetStateAction, useState } from 'react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { Progress } from '@heroui/react';
import Dropzone from 'react-dropzone';
import { LeanNote, LeanUser } from '@/utils/mongodb';
import {
  filterCurrentFiles,
  createNoteDocument,
  createFileDocuments,
  handleNoteDeletion,
  handleFileDeletion,
  handlePresignedUrls,
  processFile
} from '@/components/fileupload/utils';

const basicErrorMsg =
  'There was an error uploading your files, try again later.';

const feedbackDuration = { duration: 3000 };

interface UploaderProps {
  currentUser: null | LeanUser;
  currentNoteID: null | string;
  localNote: null | LeanNote;
  setLocalNote: Dispatch<SetStateAction<LeanNote | null>>;
  inFlight: boolean;
  setFlightStatus: Dispatch<SetStateAction<boolean>>;
}

export const Uploader = ({
  currentUser,
  currentNoteID,
  localNote,
  setLocalNote,
  inFlight,
  setFlightStatus
}: UploaderProps): ReactNode => {
  const [progressValue, updateProgress] = useState(0);

  const handleUploadFlow = async <T extends File>({
    acceptedFiles,
    userId,
    targetNote,
    isNewNote
  }: {
    acceptedFiles: T[];
    userId: string;
    targetNote: LeanNote;
    isNewNote: boolean;
  }) => {
    // 2) Create all the File documents associated with that Note.
    let currentFiles = [...acceptedFiles];

    const fileInfoArray = currentFiles.map((file) => ({
      name: file.name,
      type: file.type
    }));

    const createdFiles = await createFileDocuments(
      fileInfoArray,
      userId,
      targetNote._id
    );
    updateProgress(20);

    if (createdFiles.length === 0) {
      if (isNewNote) {
        await handleNoteDeletion(targetNote);
        setLocalNote(null);
      }

      setFlightStatus(false);
      updateProgress(0);
      toast.error(basicErrorMsg, feedbackDuration);
      return;
    }

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
      if (isNewNote) {
        await handleNoteDeletion(targetNote);
        setLocalNote(null);
      }

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

    /*
      4) Upload each media file to s3, update the File document with the
         s3_key in the database, send SQS message to the Extractor Queue. 
    */

    const uploadResults = await Promise.allSettled(
      currentFiles.map(async (file) => {
        const [targetPayload] = presignPayloads.filter(
          (s3Payload) => s3Payload.file_name === file.name
        );
        return await processFile(file, targetPayload);
      })
    );

    updateProgress(75);

    uploadResults.forEach((result) => {
      if (result.status === 'rejected') {
        // TODO: Handle in telemetry.
        console.error('Uploading file to s3 failed: ', result.reason);
      }
    });

    const successfulResults = uploadResults.filter(
      (r) => r.status === 'fulfilled'
    );
    updateProgress(100);

    // 5) Trigger user feedback toast message and reset local state.
    switch (successfulResults.length) {
      // TODO: Trigger Note and File deletions if there were no successful results.
      case 0:
        toast.error(
          'There was a problem saving your files. Try again later.',
          feedbackDuration
        );
        break;
      case currentFiles.length:
        toast.success(
          'Your files were successfully uploaded.',
          feedbackDuration
        );
        break;
      default:
        toast.success(
          'Some but not all your files were saved. Try saving those files again later.',
          feedbackDuration
        );
        break;
    }

    setFlightStatus(false);

    setLocalNote(null);

    updateProgress(0);
  };

  const handleNormalUpload = async <T extends File>(acceptedFiles: T[]) => {
    if (!currentUser) return;

    setFlightStatus(true);
    updateProgress(3);

    // 1) Create a Note document.
    const newNoteTitle = `Untitled Note - ${dayjs().format('dddd, MMMM D, YYYY h:mm A')}`;
    const newNote = await createNoteDocument(currentUser._id, newNoteTitle);

    if (!newNote) {
      setFlightStatus(false);
      updateProgress(0);
      toast.error(basicErrorMsg, feedbackDuration);
      return;
    }

    setLocalNote(newNote);

    updateProgress(13);

    await handleUploadFlow({
      acceptedFiles,
      userId: currentUser._id,
      targetNote: newNote,
      isNewNote: true
    });
  };

  const handleUpdateUpload = async <T extends File>(acceptedFiles: T[]) => {
    if (!currentUser || !localNote) return;

    setFlightStatus(true);
    updateProgress(7);

    /*
      1) There is the possibility a Note was created in the sibling NoteForm.
         currenteNoteID with a null value explicitly states that indeed
         the localNote was just created in the sibling NoteForm and
         should be deleted from the database on failure or deleted from
         localNote state if the Files upload successfully.
    */
    await handleUploadFlow({
      acceptedFiles,
      userId: currentUser._id,
      targetNote: localNote,
      isNewNote: currentNoteID === null
    });
  };

  if (!currentUser) return null;

  return (
    <div className="w-[900px]">
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

      <Dropzone
        disabled={inFlight}
        onDrop={(acceptedFiles) =>
          localNote
            ? handleUpdateUpload(acceptedFiles)
            : handleNormalUpload(acceptedFiles)
        }
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

  - Add router.refresh() after uploading the files? 🤔

  - If you have multiple long format videos (> 15 minutes), it will take a long time to
    upload all the files to s3. Need feedback to tell user to wait.

  - Should we delete the Note if all the processFile operations failed? 🤔

*/
