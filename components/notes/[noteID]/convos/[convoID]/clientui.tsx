'use client';
import { ReactNode, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ChatBox } from '@/components/chatbox';
import { LeanConversation, LeanUser, LeanNote } from '@/utils/mongodb';
import { createConversation } from '@/actions/schemamodels/conversations';
import { SubmitEvent } from '@/utils/ts';
import { ChatThread } from '@/components/chatthread';
import { ConvoContext } from '@/components/context';
interface ClientUIProps {
  currentUser: LeanUser;
  currentNote: LeanNote;
  convo: LeanConversation;
}

const toastOptions = { duration: 6000 };

// /notes/[noteID]

export const ClientUI = ({
  currentUser,
  currentNote,
  convo
}: ClientUIProps): ReactNode => {
  const { currentConvo, convoThread, setCurrentConvo } =
    useContext(ConvoContext);

  // console.log('currentConvo in ClientUI ', currentConvo);
  // console.log('convoThread in ClientUI ', convoThread);
  // console.log('\n');

  useEffect(() => {
    if (convo && setCurrentConvo && currentConvo === null) {
      setCurrentConvo(convo);
    }
  }, [convo, currentConvo, setCurrentConvo]);

  //   TODO: Delete border in parent container.
  return (
    <div className="min-h-screen border p-6 flex flex-col justify-between">
      <ChatThread convoThread={convoThread} />
      <ChatBox currentUser={currentUser} />
    </div>
  );
};
