'use client';
import { ReactNode } from 'react';
import { Button } from '@heroui/react';
import { LeanUser, LeanNote, LeanFile } from '@/utils/mongodb';

interface NumberNoteMainUIProps {
  currentUser: LeanUser;
  currentNote: LeanNote;
  noteFiles: LeanFile[];
}

export const EditNoteMainUI = ({
  currentUser,
  currentNote,
  noteFiles
}: NumberNoteMainUIProps): ReactNode => {
  console.log('currentUser in NumberNoteMainUI ', currentUser);

  return (
    <main className="p-6 w-[85%]">
      <h1 className="text-3xl lg:text-6xl mb-16">
        Note Page for: {currentNote?.title}
      </h1>

      <h2 className="text-3xl lg:text-4xl mb-6">Files Attached to Your Note</h2>

      {noteFiles.length === 0 && (
        <p className="text-xl">
          You have no files attached to this Note. You can add files to the note
          in the dropdown below.
        </p>
      )}

      {noteFiles.length > 0 && (
        <ul className="space-y-4 mb-20">
          {noteFiles.map((fileDoc) => (
            <li key={fileDoc._id} className="border p-5">
              <span className="font-semibold">File Name</span>:{' '}
              {fileDoc.file_name} &nbsp; | &nbsp;{' '}
              <span className="font-semibold">File Type</span>:{' '}
              {fileDoc.file_type} &nbsp; | &nbsp;{' '}
              <Button
                size="sm"
                variant="ghost"
                isIconOnly={true}
                onPress={() => {
                  console.log('CLICKING BUTTON');
                }}
              >
                🗑️
              </Button>
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-3xl lg:text-4xl mb-16">
        Upload More Files to Your Note
      </h2>

      <article className="mb-16">
        <p className="text-xl mb-2">
          <span className="font-bold">Media Upload Instructions</span>:
        </p>

        <p className="text-lg mb-3 font-bold text-red-700">
          🙅🏽‍♀️ DO NOT GO TO ANOTHER PAGE IN THE APP WHILE UPLOADING FILES.
        </p>

        <p className="text-lg mb-8">
          <span className="font-bold">
            Wait until all the media files are uploaded
          </span>{' '}
          to the cloud for transcribing. Then you can create a brand new Note
          with new media files or navigate to another part of the app.
        </p>

        <p className="text-lg mb-3">
          While you wait for the media files to be transcribed, go do something
          else. ☕️ We&apos;ll let you know when it&apos;s done.
        </p>
      </article>
    </main>
  );
};
