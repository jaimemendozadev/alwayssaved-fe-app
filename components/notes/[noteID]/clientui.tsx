'use client';
import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { Button, Tooltip } from '@heroui/react';
import { LeanNote, LeanFile, LeanConversation } from '@/utils/mongodb';
interface ClientUIProps {
  currentNote: LeanNote;
  noteFiles: LeanFile[];
  convos: LeanConversation[];
}

export const ClientUI = ({
  currentNote,
  noteFiles,
  convos
}: ClientUIProps): ReactNode => {
  const router = useRouter();
  const editURL = `/notes/${currentNote._id.toString()}/edit`;
  const convoURL = `/notes/${currentNote._id.toString()}/convos`;

  const handleConvoDeletion = async (convoID: string): Promise<void> => {
    /*
      TODO: On Conversation Deletion:
       - Delete All ConvoMessages attached to Conversation._id
       - Delete Conversation.

    */
  };

  return (
    <div className="p-6 w-[85%]">
      <h1 className="text-3xl lg:text-6xl mb-16">
        Note Page for: {currentNote?.title}
      </h1>

      <div className="mb-20">
        <Button size="md" variant="ghost" onPress={() => router.push(editURL)}>
          ✍🏼 Edit Note
        </Button>
      </div>

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
        <div className="mb-36">
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
            Click on the link to the{' '}
            <Link
              className="hover:underline underline-offset-4 text-blue-700"
              href={convoURL}
            >
              {' '}
              Note Conversations Page
            </Link>{' '}
            to view all your convos with the LLM.
          </p>

          <p className="text-2xl">Or you could start a new Chat. 🤖</p>
        </div>
      )}

      <h2 className="text-3xl lg:text-4xl mb-6">
        💬 Conversations for {currentNote.title} Note
      </h2>

      {convos.length === 0 ? (
        <>
          <p className="text-2xl mb-4">
            You have no Conversations for this Note.
          </p>
          <p className="text-2xl">
            <Link
              className="hover:underline underline-offset-4 text-blue-700"
              href={`/notes/${currentNote._id}/convos/new`}
            >
              Create a Conversation for this Note
            </Link>{' '}
            to start chatting with the LLM. 🤖
          </p>
        </>
      ) : (
        <>
          <p className="text-2xl mb-16">
            Click on the Conversation link to view the Convo Chat thread and
            continue chatting with the LLM about your Note. 🦾
          </p>
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
                  &nbsp; | &nbsp;{' '}
                  <Tooltip content="Delete Convo">
                    <Button
                      size="sm"
                      variant="ghost"
                      isIconOnly={true}
                      aria-label="Delete"
                      onPress={async () => await handleConvoDeletion(convo._id)}
                    >
                      🗑️
                    </Button>
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};
