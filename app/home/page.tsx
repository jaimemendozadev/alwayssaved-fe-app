'use client';
import { useEffect, useState } from 'react';
import { LeanUser } from '@/utils/mongodb';
import { getUserFromDB } from '@/actions';
import { FileUpload } from '@/components/fileupload';
import { UploadInstructions } from '@/components/uploadinstructions';

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

          const updatedTitle = currentUser && currentUser.first_name ? `🏡 Welcome ${currentUser.first_name}` : DEFAULT_TITLE;
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

      <UploadInstructions />

      <FileUpload currentUser={currentUser} currentNoteID={null} />
    </div>
  );
}
