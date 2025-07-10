'use client';
import { ReactNode } from 'react';
import Link from 'next/link';
import { Button, Tooltip } from '@heroui/react';
import dayjs from 'dayjs';
import { LeanConversation } from '@/utils/mongodb';

interface ConvoMainUIProps {
  convos: LeanConversation[];
}

export const ConvoMainUI = ({ convos }: ConvoMainUIProps): ReactNode => {
  const handleConvoDeletion = async (convoID: string): Promise<void> => {
    /*
      TODO: On Conversation Deletion:
       - Delete All ConvoMessages attached to Conversation._id
       - Delete Conversation.

    */
  };

  return (
    <div>
      <h1>ConvoMainUI Page</h1>

      {convos.length === 0 ? (
        <p className="text-2xl">
          You have no Conversations for this note. Create a Conversation for
          this Note
          <Link
            className="hover:underline underline-offset-4 text-blue-700"
            href="/"
          >
            to start chatting with the LLM
          </Link>
          🤖.
        </p>
      ) : (
        <p className="text-2xl mb-16">
          Click on the Conversation link to view the Convo Chat thread and
          continue chatting with the LLM about your Note. 🦾
        </p>
      )}

      {convos.length > 0 && (
        <ul className="space-y-7">
          {convos.map((convo) => {
            return (
              <li className="border p-5" key={convo._id}>
                <Link
                  className="hover:underline underline-offset-4"
                  href={`/notes/${convo.note_id}/convo/${convo._id}`}
                >
                  <span className="font-semibold">Convo Name</span>:{' '}
                  {convo.title} &nbsp; | &nbsp;{' '}
                  <span className="font-semibold">Convo Start Date</span>:{' '}
                  {dayjs(convo.date_started).format('dddd, MMMM D, YYYY')}
                </Link>
                &nbsp; | &nbsp;{' '}
                <Tooltip content="Delete Note">
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
      )}
    </div>
  );
};
