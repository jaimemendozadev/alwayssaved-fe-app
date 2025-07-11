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
}

const toastOptions = { duration: 6000 };

// /notes/[noteID]

export const ClientUI = ({
  currentUser,
  currentNote
}: ClientUIProps): ReactNode => {
  const [inFlight, setFlightStatus] = useState(false);
  const [localConvo, setLocalConvo] = useState<LeanConversation | null>(null);

  const chatSubmit = (evt: SubmitEvent): Promise<void> => {
    evt.preventDefault();

    return;
  };

  useEffect(() => {
    async function loadNewConversation() {
      setFlightStatus(true);
      const newConvo = await createConversation(
        currentUser._id,
        currentNote._id
      );

      if (newConvo) {
        setLocalConvo(newConvo);

        setFlightStatus(false);
        return;
      }

      throw new Error(
        `There was a problem creating a new Conversation for User ${currentUser._id} Note ${currentNote._id}`
      );
    }

    if (!localConvo) {
      loadNewConversation();
    }
  }, []);

  return (
    <div className="p-6 w-[85%]">
      <ChatBox inFlight={inFlight} convo={localConvo} chatSubmit={chatSubmit} />
    </div>
  );
};
