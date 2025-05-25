'use client';
import { useEffect, useState } from 'react';
import Dropzone from 'react-dropzone';
import { LeanUser } from '@/utils/mongodb';
import { getUserFromDB, s3FileUpload } from '@/actions';

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
        <Dropzone onDrop={(acceptedFiles) => {

          console.log("acceptedFiles ", acceptedFiles);
          console.log("\n");

          // s3FileUpload()
        }}>
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


/*
  File Upload Flow:

  When a user drops or selects X number of files:

    [ ]: Create a single MongoDB Note document.
    [ ]: Create a MongoDB File document for each dropped-in/uploaded file.
    [ ]: Upload each selected file with FileID and NoteID to s3.
    [ ]: Trigger Toast Message indicating upload result:
      - For now, do not redirect the user to another page.

*/
