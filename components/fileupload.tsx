'use client';
import { useEffect, useState } from 'react';
import Dropzone from 'react-dropzone';
import { LeanUser } from '@/utils/mongodb';
import { getUserFromDB, } from '@/actions';

import { s3FileUpload } from '@/actions/upload';

interface FileUploadProps {
    currentUser: LeanUser | null
}

export default function FileUpload({currentUser}: FileUploadProps ) {

  console.log('currentUser in FileUpload: ', currentUser);

  if(!currentUser) return null;


  return (
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
