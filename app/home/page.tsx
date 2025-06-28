'use client';
import { useEffect, useState } from 'react';
import { LeanUser } from '@/utils/mongodb';
import { getUserFromDB } from '@/actions';
import { useLLM_Api } from '@/utils/hooks';

import { FileUpload } from '@/components/fileupload';

const errorMessage =
  'Looks like you might have never registered to AlwaysSaved. 😬 Try again later.';

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<LeanUser | null>(null);
  const { makeLLM_Request } = useLLM_Api();

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

      <main className="p-6 w-[85%]">
        <h1 className="text-3xl lg:text-6xl mb-16">🏡 Home Page</h1>
        <button
          onClick={async () => {
            await makeLLM_Request('/notes/note123', {
              method: 'POST',
              body: {
                file_ids: ['dummy_file_id_1'],
                message: 'Hello from frontend'
              }
            });
          }}
        >
          TEST API ROUTE
        </button>
        <FileUpload currentUser={currentUser} />
      </main>
    </div>
  );
}
