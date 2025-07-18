'use client';
import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { Button } from '@heroui/react';
import {
  LeanNote,
  LeanFile,
  LeanConversation,
  LeanUser
} from '@/utils/mongodb';
import { createConversation } from '@/actions/schemamodels/conversations';

interface ClientUIProps {
  currentUser: LeanUser;
  currentNote: LeanNote;
  noteFiles: LeanFile[];
  convos: LeanConversation[];
}

export const ClientUI = ({
  currentUser,
  currentNote,
  noteFiles,
  convos
}: ClientUIProps): ReactNode => {
  const router = useRouter();
  const editURL = `/notes/${currentNote._id.toString()}/edit`;

  const handleNewConvo = async () => {
    const newConvo = await createConversation(currentUser._id, currentNote._id);

    if (newConvo) {
      router.push(`/notes/${currentNote._id}/convos/${newConvo._id}`);
    }

    throw new Error(
      `There was an error creating a new Conversation for Note ${currentNote._id}`
    );
  };

  return (
    <div className="p-6 w-[85%]">
      <h1 className="text-3xl lg:text-6xl mb-16">
        Note Page for: {currentNote?.title}
      </h1>

      <p className="text-2xl mb-4">
        Click on the &lsquo;Edit Note&rsquo; button to do any of the following:
      </p>
      <ul className="text-2xl mb-8">
        <li>☑️ Delete or upload new files to your Note;</li>
        <li>☑️ Delete unwanted Conversations;</li>
        <li>☑️ Change the Title of your Note; or</li>
        <li>☑️ Delete your entire Note. 😱</li>
      </ul>

      <div className="mb-32">
        <Button size="md" variant="ghost" onPress={() => router.push(editURL)}>
          ✍🏼 Edit Note
        </Button>
      </div>

      <h2 className="text-3xl lg:text-4xl mb-10">
        💬 Conversations for {currentNote.title} Note
      </h2>

      {convos.length === 0 && (
        <div className="mb-32">
          <p className="text-2xl mb-4">
            You have no Conversations for this Note.
          </p>
          {noteFiles.length > 0 && (
            <>
              <p className="text-2xl mb-8">
                Create a Conversation for this Note to start chatting with the
                LLM. 🤖
              </p>
              <div>
                <Button
                  size="md"
                  variant="ghost"
                  onPress={async () => await handleNewConvo()}
                >
                  💬 Create Convo
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {convos.length > 0 && (
        <div className="mb-44">
          <div className="mb-24">
            <p className="text-2xl mb-4">
              Click on any Conversation link below to view the Convo Chat thread
              and continue chatting with the LLM about your Note files. 🦾
            </p>

            {noteFiles.length > 0 && (
              <>
                <p className="text-2xl mb-16">
                  Or you can click on the &lsquo;Create Convo&rsquo; button and
                  start a new Conversation about your Note Files.
                </p>

                <div>
                  <Button
                    size="md"
                    variant="ghost"
                    onPress={async () => await handleNewConvo()}
                  >
                    💬 Create Convo
                  </Button>
                </div>
              </>
            )}
          </div>

          <ul className="space-y-7">
            {convos.map((convo) => {
              return (
                <li className="border p-5" key={convo._id}>
                  <Link
                    className="hover:underline underline-offset-4"
                    href={`/notes/${convo.note_id}/convos/${convo._id}`}
                  >
                    <span className="font-semibold">Convo Name</span>:{' '}
                    {convo.title} &nbsp; | &nbsp;{' '}
                    <span className="font-semibold">Convo Start Date</span>:{' '}
                    {dayjs(convo.date_started).format('dddd, MMMM D, YYYY')}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <h2 className="text-3xl lg:text-4xl mb-6">Files Attached to Your Note</h2>

      {noteFiles.length === 0 ? (
        <div className="mb-36">
          <p className="text-xl mb-1">
            You have no files attached to this Note. 😔
          </p>
          <p className="text-xl mb-20">
            You can add files to the note by clicking on the 👆🏽 above
            &ldquo;Edit Your Note&rdquo; link.
          </p>
        </div>
      ) : (
        <ul className="space-y-4 mb-40">
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
    </div>
  );
};

/***************************
 * Notes
 ***************************

 1) Conversation & ConvoMessage documents are not
    hard deleted in the app. They're marked with
    date_deleted value in the document. They will
    be removed from the database in a separate
    async job.

*/
