'use server';
import { ReactNode } from 'react';
import Link from 'next/link';
import { getUserFromDB } from '@/actions';
import { getNoteByID } from '@/actions/schemamodels/notes';
import { getFilesByFields } from '@/actions/schemamodels/files';
export default async function NoteIDPage({
  params
}: {
  params: { noteID: string };
}): Promise<ReactNode> {
  const { noteID } = await params;

  const currentNote = await getNoteByID(noteID);

  const currentUser = await getUserFromDB();

  let noteFiles = null;

  if (currentNote && currentUser) {
    noteFiles = await getFilesByFields(currentUser._id, {
      _id: 1,
      s3_key: 1,
      file_name: 1,
      file_type: 1
    });
  }

  if (currentUser && currentNote && noteFiles) {
    return (
      <main className="p-6 w-[85%]">
        <h1 className="text-3xl lg:text-6xl mb-16">
          Note Page for: {currentNote?.title}
        </h1>

        <p className="mb-8">
          <Link
            className="hover:underline underline-offset-4"
            href={`${currentNote._id.toString()}/edit`}
          >
            ✍🏼 Edit Your Note
          </Link>
        </p>

        {noteFiles.length > 0 && (
          <ul className="space-y-4 mb-20">
            {noteFiles.map((fileDoc) => (
              <li key={fileDoc._id} className="border p-5">
                <span className="font-semibold">File Name</span>:{' '}
                {fileDoc.file_name} &nbsp; | &nbsp;{' '}
                <span className="font-semibold">File Type</span>:{' '}
                {fileDoc.file_type}
              </li>
            ))}
          </ul>
        )}
      </main>
    );
  }
  throw new Error(`There was an error displaying the Note Page for ${noteID}`);
}
