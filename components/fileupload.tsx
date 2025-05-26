'use client';
import { useState, ReactNode } from 'react';
import dayjs from 'dayjs';
import Dropzone from 'react-dropzone';
import {
  createNoteFileDocs,
  createPresignedUrl,
  handleFileDocUpdate
} from '@/actions/fileupload';
import { LeanUser } from '@/utils/mongodb';
import { InputEvent } from '@/utils/ts';

interface FileUploadProps {
  currentUser: LeanUser | null;
}

const defaultNoteTitle = `Untitled Note - ${dayjs().format('MMMM D, YYYY')}`;

export default function FileUpload({
  currentUser
}: FileUploadProps): ReactNode {
  console.log('currentUser in FileUpload: ', currentUser);

  const [noteTitle, setNoteTitle] = useState(defaultNoteTitle);

  if (!currentUser) return null;

  const handleChange = (evt: InputEvent) => {
    console.log('evt in handleChange ', evt);

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

    // 1) Create a Note Doc and all File Docs associated with that Note.
    const filePayloads = acceptedFiles.map((file) => ({
      name: file.name,
      type: file.type
    }));

    console.log('filePayloads ', filePayloads);

    const currentUserID = currentUser._id;

    const noteFileResult = await createNoteFileDocs({
      filePayloads,
      currentUserID,
      noteTitle
    });

    // TODO: Handle case where fileDBResults.length doesn't equal filePaylods.length

    // 2) Create the presignUrls for each File document.

    const { newNote, fileDBResults } = noteFileResult;

    console.log('noteFileResult ', noteFileResult);

    // TODO: Handle case where s3PayloadResults.length doesn't equal fileDBResults.length

    const s3PayloadResults = await createPresignedUrl({
      fileDocuments: fileDBResults
    });

    console.log('s3PayloadResults ', s3PayloadResults);

    // 3) Upload each media file to s3.
    const uploadResults = await Promise.allSettled(
      acceptedFiles.map(async (file) => {
        const targetName = file.name;
        const targetType = file.type;

        const [targetPayload] = s3PayloadResults.filter(
          (s3Payload) => s3Payload.file_name === targetName
        );

        const { presigned_url, file_id, s3_key } = targetPayload;

        await fetch(presigned_url, {
          method: 'PUT',
          headers: { 'Content-Type': targetType },
          body: file
        });

        return {
          file_id,
          update: { s3_key }
        };
      })
    );

    // TODO: Handle case where filteredUploadResults.length doesn't equal uploadResults.length
    const filteredUploadResults = uploadResults.filter(
      (result) => result.status === 'fulfilled'
    );

    const finalizedUploadResults = filteredUploadResults.map(
      (result) => result.value
    );

    // 4) Update each File document with their s3_key.

    const fileUpdateResults = await handleFileDocUpdate({
      fileUpdates: finalizedUploadResults
    });

    console.log('fileUpdateResults ', fileUpdateResults);
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
}

/*
  File Upload Flow:

  When a user drops or selects X number of files:

    [ ]: Upload each selected file with FileID and NoteID to s3.
    [ ]: Trigger Toast Message indicating upload result:
      - For now, do not redirect the user to another page.



   export interface INote {
     _id: mongoose.Types.ObjectId;
     user_id: mongoose.Types.ObjectId | IUser;
     title: string;
     date_created: Date;
     date_deleted: Date | null;
   //   files: []
   }   

*/
