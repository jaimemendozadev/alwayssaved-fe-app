'use client';
import { ReactNode, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ChatBox } from '@/components/chatbox';
import {
  LeanConversation,
  LeanUser,
  LeanNote,
  LeanConvoMessage
} from '@/utils/mongodb';
import { createConversation } from '@/actions/schemamodels/conversations';
import { SubmitEvent } from '@/utils/ts';
import { ChatThread } from '@/components/chatthread';
import { ConvoContext } from '@/components/context';
interface ClientUIProps {
  currentUser: LeanUser;
  currentNote: LeanNote;
  convo: LeanConversation;
}

export const ClientUI = ({
  currentUser,
  currentNote,
  convo
}: ClientUIProps): ReactNode => {
  const { currentConvo, convoThread, setCurrentConvo, updateThread } =
    useContext(ConvoContext);

  useEffect(() => {
    if (convo && setCurrentConvo && currentConvo === null) {
      setCurrentConvo(convo);
    }
    if (convoMessages) {
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
