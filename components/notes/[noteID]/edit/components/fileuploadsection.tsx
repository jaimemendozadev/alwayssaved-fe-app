'use client';
import { ReactNode } from 'react';
import { LeanUser } from '@/utils/mongodb';
import { FileUpload } from '@/components/fileupload';

interface FileUploadSectionProps {
  currentUser: LeanUser;
  currentNoteID: string;
  handleRedirect: () => void;
}

export const FileUploadSection = ({
  currentNoteID,
  currentUser,
  handleRedirect
}: FileUploadSectionProps): ReactNode => {
  return (
    <>
      <h2 className="text-3xl lg:text-4xl mb-10">
        Upload More Files to Your Note
      </h2>

      <article className="mb-24">
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

      <div className="mb-44">
        <FileUpload
          currentUser={currentUser}
          currentNoteID={currentNoteID}
          routerCallback={handleRedirect}
        />
      </div>
    </>
  );
};
