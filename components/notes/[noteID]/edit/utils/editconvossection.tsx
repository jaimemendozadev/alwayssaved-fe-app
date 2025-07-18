'use client';
import { ReactNode } from 'react';
import dayjs from 'dayjs';
import Link from 'next/link';
import { Button, Tooltip } from '@heroui/react';
import { LeanConversation, LeanFile, LeanNote } from '@/utils/mongodb';

interface EditConvosSectionProps {
  currentNote: LeanNote;
  noteFiles: LeanFile[];
  convos: LeanConversation[];
  handleNewConvo: () => void;
  handleConvoDeletion: (convoID: string) => void;
}
export const EditConvosSection = ({
  currentNote,
  noteFiles,
  convos,
  handleNewConvo,
  handleConvoDeletion
}: EditConvosSectionProps): ReactNode => {
  return (
    <>
      <h2 className="text-3xl lg:text-4xl mb-10">
        💬 Remove or Add Conversations for {currentNote.title} Note
      </h2>

      {noteFiles.length === 0 ? (
        <div className="mb-32">
          <p className="text-xl mb-8">
            You have no Files attached to this Note. 😔
          </p>
          <p className="text-xl mb-8">
            You&apos;ll need to upload Files to this Note before you can start
            having a Conversation with the LLM. 🤖
          </p>
          <p className="text-xl mb-20">
            You can add Files to the Note in the file uploader above. ☝️
          </p>
        </div>
      ) : (
        <div className="mb-32">
          <p className="text-2xl mb-8">
            Click on the &lsquo;Create Convo&rsquo; button and start chatting
            with the LLM about your Note Files. 🤖
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
        </div>
      )}

      {convos.length > 0 ? (
        <div className="mb-24">
          <p className="text-2xl mb-4">
            Click on the &lsquo;Delete Convo&rsquo; trash can button to remove
            any Conversation attached to your Note. 🗑️
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
                    {dayjs(convo.date_started).format('dddd, MMMM D, YYYY')}{' '}
                    &nbsp;{' '}
                  </Link>
                  <Tooltip content="Delete Convo">
                    <Button
                      size="sm"
                      variant="ghost"
                      isIconOnly={true}
                      aria-label="Delete Conversation"
                      onPress={async () => await handleConvoDeletion(convo._id)}
                    >
                      🗑️
                    </Button>
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="mb-24">
          <p className="text-2xl">You have no Conversations for this Note.</p>
        </div>
      )}
    </>
  );
};
