'use client';
import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/react';
import { LeanNote, LeanFile } from '@/utils/mongodb';
interface ClientUIProps {
  currentNote: LeanNote;
  noteFiles: LeanFile[];
}

export const ClientUI = ({
  currentNote,
  noteFiles
}: ClientUIProps): ReactNode => {
  const router = useRouter();
  const editURL = `${currentNote._id.toString()}/edit`;
  const convoURL = `${currentNote._id.toString()}/convos`;

  return (
    <div className="p-6 w-[85%]">
      <h1 className="text-3xl lg:text-6xl mb-16">
        Note Page for: {currentNote?.title}
      </h1>

      <div className="mb-14">
        <Button size="md" variant="ghost" onPress={() => router.push(editURL)}>
          ✍🏼 Edit Note
        </Button>
      </div>

      <h2 className="text-3xl lg:text-4xl mb-6">Files Attached to Your Note</h2>

      {noteFiles.length > 0 ? (
        <>
          <ul className="space-y-4 mb-32">
            {noteFiles.map((fileDoc) => (
              <li key={fileDoc._id} className="border p-5">
                <span className="font-semibold">File Name</span>:{' '}
                {fileDoc.file_name} &nbsp; | &nbsp;{' '}
                <span className="font-semibold">File Type</span>:{' '}
                {fileDoc.file_type}
              </li>
            ))}
          </ul>
          <p className="text-2xl mb-4">
            Click on the link to the <Link className="hover:underline underline-offset-4 text-blue-700" href={convoURL}> Note Conversations Page</Link> to view all your convos with the LLM.
          </p>

          <p className="text-2xl">Or you could start a new Chat. 🤖</p>
        </>
      ) : (
        <div>
          <p className="text-xl mb-1">
            You have no files attached to this Note. 😔
          </p>
          <p className="text-xl mb-20">
            You can add files to the note by clicking on the 👆🏽 above
            &ldquo;Edit Your Note&rdquo; link.
          </p>
        </div>
      )}
    </div>
  );
};
