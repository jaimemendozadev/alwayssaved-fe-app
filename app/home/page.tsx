'use client';
import { useEffect, useState } from 'react';
import { LeanUser } from '@/utils/mongodb';
import { getUserFromDB } from '@/actions';

import FileUpload from '@/components/fileupload';

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
  return (
    <div className="flex">
      <div className="w-[15%] bg-[#f9f9f9] min-h-screen"></div>

      <main className="p-6">
        <h1 className="text-3xl lg:text-6xl mb-8">🏡 Home Page</h1>
        <FileUpload currentUser={currentUser} />
      </main>
    </div>
  );
}


/*
  File Upload Flow:

  When a user drops or selects X number of files:

    [ ]: Create a single MongoDB Note document.
    [ ]: Create a MongoDB File document for each dropped-in/uploaded file.
    [ ]: Upload each selected file with FileID and NoteID to s3.
    [ ]: Trigger Toast Message indicating upload result:
      - For now, do not redirect the user to another page.

*/
