'use client';
import { ReactNode, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ChatBox } from '@/components/chatbox';
import { LeanConversation, LeanUser, LeanNote } from '@/utils/mongodb';
import { createConversation } from '@/actions/schemamodels/conversations';
import { SubmitEvent } from '@/utils/ts';
import { ChatThread } from '@/components/chatthread';
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
  const [localConvo, setLocalConvo] = useState<LeanConversation | null>(null);

  useEffect(() => {
    if (convo) {
      setLocalConvo(convo);
    }
  }, [convo]);

  //   TODO: Delete border in parent container.
  return (
    <div className="min-h-screen border p-6 flex flex-col justify-between relative">
      <ChatThread />
      <ChatBox convo={localConvo} />
    </div>
  );
};
