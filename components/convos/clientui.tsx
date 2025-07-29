'use client';
import { ReactNode } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import { LeanConversation, LeanUser } from '@/utils/mongodb';

interface ClientUIProps {
  currentUser: LeanUser;
  convos: LeanConversation[];
}

export const ClientUI = ({
  currentUser,
  convos
}: ClientUIProps): ReactNode => {

  return (
    <div className="p-6 w-[85%]">
      <h1 className="text-3xl lg:text-6xl mb-16">
        💬 {currentUser.first_name}&#39;s Convos
      </h1>

      {convos.length === 0 && (
        <div className="mb-32">
          <p className="text-2xl mb-4">
            You have no active Conversations at this time.
          </p>
        </div>
      )}

      {convos.length > 0 && (
        <div className="mb-44">
          <div className="mb-24">
            <p className="text-2xl mb-4">
              Click on any Conversation link below to view the Convo Chat thread
              and continue chatting with the LLM about your Note files. 🦾
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
    </div>
  );
};
