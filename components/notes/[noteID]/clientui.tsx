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
      return;
    }

    throw new Error(
      `There was an error creating a new Conversation for Note ${currentNote._id}`
    );
  };

  return (
    <div className="p-6 w-[85%]">
      <h1 className="text-3xl lg:text-6xl mb-20">
        Note Page for: {currentNote?.title}
      </h1>

      <h2 className="text-3xl lg:text-4xl mb-10">
        💬 Create a New Conversation
      </h2>

      {noteFiles.length > 0 ? (
        <>
          <p className="text-2xl mb-8">
            Create a new Conversation for this Note to start chatting with the
            LLM. 🤖
          </p>
          <div className="mb-32">
            <Button
              size="md"
              variant="ghost"
              onPress={async () => await handleNewConvo()}
            >
              💬 Create Convo
            </Button>
          </div>
        </>
      ) : (
        <p className="text-2xl mb-32">
          You have no media files attached to this Note. Add media files in
          order to get a conversation started.
        </p>
      )}

      <hr className="mb-16" />

      <h2 className="text-3xl lg:text-4xl mb-6">✍🏼 Edit Your Note</h2>

      <p className="text-2xl mb-4">
        Click on the &ldquo;Edit Note&rdquo; button to make permanent changes to
        the Note.
      </p>

      <p className="text-2xl mb-8">
        You can delete unwanted Conversations or files from the Note, change the
        Note&rsquo;s Title, or delete the entire Note.
      </p>

      <div className="mb-32">
        <Button size="md" variant="ghost" onPress={() => router.push(editURL)}>
          ✍🏼 Edit Note
        </Button>
      </div>

      <hr className="mb-16" />

      <h2 className="text-3xl lg:text-4xl mb-10">📓 Current Conversations</h2>

      {convos.length === 0 && (
        <div className="mb-32">
          <p className="text-2xl mb-4">
            You have no Conversations for this Note.
          </p>
        </div>
      )}

      {convos.length > 0 && (
        <div className="mb-32">
          <div className="mb-24">
            <p className="text-2xl mb-4">
              Click on any Conversation link below to view the Chat thread and
              continue talking with the LLM about your files. 💬
            </p>
          </div>

          <ul className="space-y-7">
            {convos.map((convo) => {
              return (
                <li className="border-2 p-5" key={convo._id}>
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

      <hr className="mb-16" />

      <h2 className="text-3xl lg:text-4xl mb-6">
        💿 Files Attached to Your Note
      </h2>

      {noteFiles.length === 0 ? (
        <div className="mb-32">
          <p className="text-xl mb-1">
            You have no files attached to this Note. 😔
          </p>
          <p className="text-xl mb-20">
            You can add files to the note by clicking on the 👆🏽 above
            &ldquo;Edit Your Note&rdquo; link.
          </p>
        </div>
      ) : (
        <ul className="space-y-6 mb-32">
          {noteFiles.map((fileDoc) => (
            <li key={fileDoc._id} className="border-2 p-5">
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
