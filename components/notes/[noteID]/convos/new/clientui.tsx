'use client';
import { ReactNode, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ChatBox } from '@/components/chatbox';
import { LeanConversation, LeanUser, LeanNote } from '@/utils/mongodb';
import { createConversation } from '@/actions/schemamodels/conversations';
import { SubmitEvent } from '@/utils/ts';

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
  const [inFlight, setFlightStatus] = useState(false);
  const [localConvo, setLocalConvo] = useState<LeanConversation | null>(null);

  const chatSubmit = (evt: SubmitEvent): Promise<void> => {
    evt.preventDefault();

    console.log('evt in chatSubmit ', evt);

    return;
  };

  useEffect(() => {
    if (convo) {
      setLocalConvo(convo);
    }
  }, [convo]);

  return (
    <div className="p-6 w-[85%]">
      <ChatBox inFlight={inFlight} convo={localConvo} chatSubmit={chatSubmit} />
    </div>
  );
};
