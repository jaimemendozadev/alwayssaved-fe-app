'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LeanUser } from '@/utils/mongodb';
import { getUserFromDB } from '@/actions';
import { FileUpload } from '@/components/fileupload';

const DEFAULT_TITLE = '🏡 Home';

const errorMessage =
  'Looks like you might have never registered or deleted your AlwaysSaved account. 😬 Try again later.';

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<LeanUser | null>(null);
  const [pageTitle, setPageTitle] = useState<string>(DEFAULT_TITLE);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const currentUser = await getUserFromDB();

        if (currentUser) {
          setCurrentUser(currentUser);

          const updatedTitle =
            currentUser && currentUser.first_name
              ? `🏡 Welcome ${currentUser.first_name}`
              : DEFAULT_TITLE;
          setPageTitle(updatedTitle);
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
      <h1 className="text-3xl lg:text-6xl mb-16">{pageTitle}</h1>

      <article className="mb-16">
        <p className="text-xl mb-2">
          <span className="font-bold">Media Upload Instructions</span>:
        </p>
        <ol className="list-decimal ml-6">
          <li className="text-lg mb-8">
            Create a new Note by filling out the form to give it a new name.
          </li>

          <ul className="text-lg mb-8">
            <li className="mb-3">
              All your media files &amp; separate LLM convos 🤖 will be stored
              as a Note.
            </li>
            <li>
              Go to the{' '}
              <Link className="underline underline-offset-4" href="/notes">
                Notes
              </Link>{' '}
              page to access individual Notes.
            </li>
          </ul>

          <li className="text-lg mb-8">
            Add video or audio files to your note for transcribing.{' '}
            <span className="font-bold">WAIT UNTIL ALL FILES ARE UPLOADED</span>{' '}
            to the cloud ☁️ for transcribing.
          </li>
          <ul className="text-lg mb-8">
            <li className="font-bold text-red-700">
              🙅🏽‍♀️ DO NOT GO TO ANOTHER PAGE IN THE APP WHILE UPLOADING FILES.
            </li>
          </ul>

          <li className="text-lg mb-8">
            When the files finish uploading, you&apos;re essentially done. You
            may now:
          </li>

          <ul className="text-lg mb-8">
            <li className="mb-3">
              Create a brand new Note with new media files; or
            </li>
            <li>Navigate to another part of the app.</li>
          </ul>

          <li className="text-lg mb-8">
            We&apos;ll send you an email 📬 to let you know when your files are
            finished processing so you can talk to the LLM about them. 🤖
          </li>
        </ol>
      </article>

      <FileUpload currentUser={currentUser} currentNoteID={null} />
    </div>
  );
}
