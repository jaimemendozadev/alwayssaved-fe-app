'use client';
import { useEffect, useState } from 'react';
import { LeanUser } from '@/utils/mongodb';
import { getUserFromDB } from '@/actions';
import { FileUpload } from '@/components/fileupload';
import { UploadText } from '@/components/uploadtext';

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
      <h1 className="text-3xl lg:text-6xl mb-16">🏡 Home</h1>

      <UploadText />

      <FileUpload currentUser={currentUser} currentNoteID={null} />
    </div>
  );
}
