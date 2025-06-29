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
    <main className="p-6 w-[85%]">
      <h1 className="text-3xl lg:text-6xl mb-16">🏡 Home Page</h1>
      <FileUpload currentUser={currentUser} />
    </main>
  );
}
