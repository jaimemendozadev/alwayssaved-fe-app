'use client';
import { ReactNode, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { Progress } from '@heroui/react';
import Dropzone from 'react-dropzone';
import { Button } from '@heroui/react';
import { LeanNote, LeanUser } from '@/utils/mongodb';
import { InputEvent, SubmitEvent } from '@/utils/ts';
import { getNoteByID, updateNoteByID } from '@/actions/schemamodels/notes';
import {
  filterCurrentFiles,
  createNoteDocument,
  createFileDocuments,
  handleNoteDeletion,
  handleFileDeletion,
  handlePresignedUrls,
  processFile
} from '@/components/fileupload/utils';

interface FileUploadProps {
  currentUser: null | LeanUser;
  currentNoteID: null | string;
}

const toastOptions = { duration: 3000 };

const getDefaultNoteTitle = () =>
  `Untitled Note - ${dayjs().format('dddd, MMMM D, YYYY h:mm A')}`;

export const FileUpload = ({
  currentUser,
  currentNoteID
}: FileUploadProps): ReactNode => {
  const [noteTitle, setNoteTitle] = useState('');
  const [defaultTitle, setDefaultTitle] = useState('');
  const [localNote, setLocalNote] = useState<LeanNote | null>(null);
  const [inFlight, setFlightStatus] = useState(false);
  const [progressValue, updateProgress] = useState(0);

  const handleChange = (evt: InputEvent) => {
    if (!setNoteTitle) return;

    if (evt?.type === 'focus') {
      if (noteTitle === defaultTitle) {
        setNoteTitle('');
        return;
      }
    }

    if (evt?.type === 'blur') {
      if (noteTitle.length === 0) {
        setNoteTitle(defaultTitle);
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

    if (!localNote) {
      const newNote = await createNoteDocument(currentUser._id, noteTitle);

      if (newNote) {
        setLocalNote(newNote);
        toast.success('A new Note has been created. 🎉', toastOptions);
        return;
      }
    }

    if (localNote) {
      await updateNoteByID(localNote?._id, { title: noteTitle });
      toast.success('Your Note title has been updated. 👏🏼', toastOptions);
    }
  };

  const handleUpload = async <T extends File>(acceptedFiles: T[]) => {
    if (!currentUser) return;

    if (!localNote) {
      toast.error(
        'You must first create a Note before uploading files. Fill out and submit the form please. 🥺',
        toastOptions
      );
      return;
    }

    setFlightStatus(true);
    updateProgress(7);

    const isNewNote = currentNoteID === null;

    // 1) Create all the File documents associated with that Note.
    let currentFiles = [...acceptedFiles];

    const fileInfoArray = currentFiles.map((file) => ({
      name: file.name,
      type: file.type
    }));

    const createdFiles = await createFileDocuments(
      fileInfoArray,
      currentUser._id,
      localNote._id
    );
    updateProgress(20);

    if (createdFiles.length === 0) {
      setFlightStatus(false);
      updateProgress(0);
      toast.error(
        'There was a problem uplading files for your Note. You can try uploading the files again later.',
        toastOptions
      );

      // TODO: Redirect to a note edit page?
      return;
    }

    // 1a) If some of the File documents failed to be created, filter the acceptedFiles.
    if (createdFiles.length !== currentFiles.length) {
      currentFiles = filterCurrentFiles(currentFiles, createdFiles);
      toast.error(
        'There was a problem uploading some of your files. Continuing with File upload process',
        toastOptions
      );
    }

    updateProgress(32);

    // 2) Create the presignUrls for each File document.
    const presignPayloads = await handlePresignedUrls(createdFiles);

    updateProgress(35);

    // 2a) If some or all of the presignURLs failed to be created, take the appropriate steps.
    if (presignPayloads.length === 0) {
      if (createdFiles.length > 0) {
        const fileIDs = createdFiles.map((file) => file._id);
        await handleFileDeletion(fileIDs);
      }

      // TODO: Redirect to a note edit page?

      setFlightStatus(false);
      updateProgress(0);
      toast.error(
        'There was a problem trying to prep your files for uploading to the cloud. You can try uploading the files for your Note again later.',
        toastOptions
      );
      return;
    }

    if (presignPayloads.length !== currentFiles.length) {
      currentFiles = filterCurrentFiles(currentFiles, presignPayloads);
      toast.error(
        'Not all of your files were prepped for uploading. Proceeding to upload remaining files.',
        toastOptions
      );
    }

    updateProgress(38);

    /*
      3) Upload each media file to s3, update the File document with the
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

    // 4) Trigger user feedback toast message and reset local state.
    switch (successfulResults.length) {
      // TODO: Trigger Note and File deletions if there were no successful results.
      case 0:
        toast.error(
          'There was a problem completing your File uploads to the cloud. You can try again later.',
          toastOptions
        );
        // TODO: Redirect to a note edit page?
        break;
      case currentFiles.length:
        toast.success(
          'Your files were successfully uploaded! 🥳',
          toastOptions
        );
        break;
      default:
        toast.success(
          'There was a slight problem uploading some of your files to the cloud. 😬 Try uploading those files again later.',
          toastOptions
        );
        break;
    }

    // TODO: Possibly reset defaultTitle & setLocalNote to null or keep as is.

    setFlightStatus(false);

    setLocalNote(null);

    updateProgress(0);
  };

  useEffect(() => {
    async function getTargetNote(targetNoteID: string): Promise<void> {
      const foundNote = await getNoteByID(targetNoteID);

      if (foundNote) {
        setNoteTitle(foundNote.title);
        setDefaultTitle(foundNote.title);
        setLocalNote(foundNote);
        return;
      }

      throw new Error(
        `Could not find the Note with noteID ${targetNoteID} to perform FileUpload update.`
      );
    }

    async function createNewLocalNote(targetUser: LeanUser) {
      const newNoteTitle = getDefaultNoteTitle();
      const newNote = await createNoteDocument(targetUser._id, newNoteTitle);

      if (newNote) {
        setNoteTitle(newNoteTitle);
        setDefaultTitle(newNoteTitle);
        setLocalNote(newNote);
      }
    }

    if (currentUser) {
      if (currentNoteID) {
        getTargetNote(currentNoteID);
        return;
      }

      createNewLocalNote(currentUser);
    }
  }, [currentNoteID, currentUser]);

  if (!currentUser) return null;

  return (
    <div className="w-[900px]">
      <form onSubmit={handleSubmit} className="mb-8 border-2 p-4">
        <div className="flex items-end">
          <label htmlFor="noteTitle" className="text-lg min-w-[400px]">
            <span className="font-bold">Note Name</span>:<br />
            <input
              className="w-[100%] p-1"
              onBlur={handleChange}
              onFocus={handleChange}
              onChange={handleChange}
              id="noteTitle"
              value={noteTitle}
              disabled={inFlight}
            />
          </label>

          <Button className="ml-4" onPress={() => console.log('BUTTON PRESS')}>
            Submit
          </Button>
        </div>
      </form>

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

      <Dropzone disabled={inFlight} onDrop={handleUpload}>
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
