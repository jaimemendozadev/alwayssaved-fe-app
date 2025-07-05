'use client';
import { useEffect, useState } from 'react';
import { LeanUser } from '@/utils/mongodb';
import { getUserFromDB } from '@/actions';
import { FileUpload } from '@/components/fileupload';

const errorMessage =
  'Looks like you might have never registered to AlwaysSaved. 😬 Try again later.';

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<LeanUser | null>(null);
  console.log('currentUser in Home Page: ', currentUser);

  useEffect(() => {
    async function loadCurrentUser() {
      const currentUser = await getUserFromDB();

      if (currentUser) {
        setCurrentUser(currentUser);
        return;
      }

      throw new Error(errorMessage);
    }

    loadCurrentUser();
  }, []);

  if (currentUser === null) return currentUser;

  return (
    <div>
      <h1 className="text-3xl lg:text-6xl mb-16">🏡 Home Page</h1>

      <article className="mb-16">
        <p className="text-xl mb-2">
          <span className="font-bold">Media Upload Instructions</span>:
        </p>
        <p className="text-lg mb-8">
          Create a new Note by giving your note a new name AND adding media
          files to your note for transcribing.
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

      <FileUpload currentUser={currentUser} currentNoteID={null} />
    </div>
  );
}
