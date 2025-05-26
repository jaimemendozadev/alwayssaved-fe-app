'use client';
import { useState, ReactNode } from 'react';
import dayjs from 'dayjs';
import Dropzone from 'react-dropzone';
import { createNoteFileDocs } from '@/actions/fileupload';
import { LeanUser } from '@/utils/mongodb';
import { InputEvent } from '@/utils/ts';

interface FileUploadProps {
  currentUser: LeanUser | null;
}

const defaultNoteName = `Untitled Note - ${dayjs().format('MMMM D, YYYY')}`;

export default function FileUpload({
  currentUser
}: FileUploadProps): ReactNode {
  console.log('currentUser in FileUpload: ', currentUser);

  const [noteName, setNoteName] = useState(defaultNoteName);

  if (!currentUser) return null;

  const handleChange = (evt: InputEvent) => {
    console.log('evt in handleChange ', evt);

    if (evt?.type === 'focus') {
      if (noteName === defaultNoteName) {
        setNoteName('');
        return;
      }
    }

    if (evt?.type === 'blur') {
      if (noteName.length === 0) {
        setNoteName(defaultNoteName);
        return;
      }
    }

    if (evt?.type === 'change') {
      setNoteName(evt.target.value);
      return;
    }
  };

  const handleUpload = async <T extends File>(acceptedFiles: T[]) => {
    console.log('acceptedFiles ', acceptedFiles);
    console.log('\n');

    const filePayloads = acceptedFiles.map((file) => ({
      name: file.name,
      type: file.type
    }));

    console.log('filePayloads ', filePayloads);

    const noteFileResult = await createNoteFileDocs({
      filePayloads,
      currentUser,
      noteName
    });

    console.log('noteFileResult ', noteFileResult);
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
        <label htmlFor="noteName" className="text-lg">
          <span className="font-bold">Your New Note Name</span>:<br />
          <input
            className="w-[100%]"
            onBlur={handleChange}
            onFocus={handleChange}
            onChange={handleChange}
            id="noteName"
            value={noteName}
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

    [ ]: Create a MongoDB File document for each dropped-in/uploaded file.
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
