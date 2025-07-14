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
import { getConversationMessages } from '@/actions/schemamodels/convomessages';
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

  console.log('convoThread in ParentUI ', convoThread);

  useEffect(() => {
    if (convo && setCurrentConvo && currentConvo === null) {
      setCurrentConvo(convo);
    }
  }, [convo, currentConvo, setCurrentConvo]);

  useEffect(() => {
    async function setConvoMessage(convoID: string) {
      const convoMessages = await getConversationMessages(convoID);
      console.log('convoMessages in CDM useEffect ', convoMessages);
      if (updateThread) {
        updateThread(convoMessages);
      }
    }

    if (convo && updateThread) {
      console.log('FIRING CDM useEffect');
      setConvoMessage(convo._id);
    }
  }, []);

  return (
    <div className="min-h-screen p-6 flex flex-col justify-between">
      <ChatThread convoThread={convoThread} />
      <ChatBox currentUser={currentUser} />
    </div>
  );
};
