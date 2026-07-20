'use client';
import { useEffect, useState } from 'react';
import { LeanUser } from '@/utils/mongodb';
import { getUserFromDB } from '@/actions';
import { FileUpload } from '@/components/fileupload';

const errorMessage =
  'Looks like you might have never registered or deleted your AlwaysSaved account. 😬 Try again later.';

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<LeanUser | null>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const currentUser = await getUserFromDB();

        if (currentUser) {
          setCurrentUser(currentUser);
          return;
        }
      } catch (error) {
        console.log('Error in app/home/page.tsx: ', error);
      }
      setLoadError(new Error(errorMessage));
    }

    loadCurrentUser();
  }, []);

  if (loadError) throw loadError;

  if (currentUser === null) return currentUser;

  return (
    <div>
      <h1 className="text-3xl lg:text-6xl mb-16">🏡 Home Page</h1>

      <article className="mb-16">
        <p className="text-xl mb-2">
          <span className="font-bold">Media Upload Instructions</span>:
        </p>
        <ol className="list-decimal ml-6">
          <li className="text-lg mb-8">
            Fill out the form below to create a new Note by giving the note a new name.
          </li>

          <li className="text-lg mb-8">
            Add video or audio files to your note for transcribing. <span className="font-bold">WAIT UNTIL ALL FILES ARE UPLOADED</span> to the cloud for transcribing.
          </li>
          <ul className="text-lg mb-8">
            <li className="mb-3 font-bold text-red-700">🙅🏽‍♀️ DO NOT GO TO ANOTHER PAGE IN THE APP WHILE UPLOADING FILES.</li>
          </ul>

          <li className="text-lg mb-8">
            When the files are finished uploading, the transcription process starts. You may now create a brand new Note with new media files or navigate to another part of the app.
          </li>

          <li className="text-lg mb-8">
            We&apos;ll send you an email 📬 to let you know when your files are transcribed.
          </li>
        </ol>
      </article>

      <FileUpload currentUser={currentUser} currentNoteID={null} />
    </div>
  );
}
