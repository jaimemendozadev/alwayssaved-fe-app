'use client';
import { useEffect, useState } from 'react';
import Dropzone from 'react-dropzone';
import { LeanUser } from '@/utils/mongodb';
import { getUserFromDB } from '@/actions';

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
        <h1>🏡 Home Page</h1>
        <Dropzone onDrop={(acceptedFiles) => console.log(acceptedFiles)}>
          {({ getRootProps, getInputProps }) => (
            <section className="border-4 border-dashed p-10">
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <p>Drag and drop some files here, or click to select files</p>
              </div>
            </section>
          )}
        </Dropzone>
      </main>
    </div>
  );
}
