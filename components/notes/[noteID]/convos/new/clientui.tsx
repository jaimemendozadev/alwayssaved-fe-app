'use client';
import { ReactNode, useEffect, useState } from 'react';
import { ChatBox } from '@/components/chatbox';
import { LeanConversation, LeanUser, LeanNote } from '@/utils/mongodb';
import { createConversation } from '@/actions/schemamodels/conversations';

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
  const [localConvo, setLocalConvo] = useState<LeanConversation | null>(null);

  useEffect(() => {
    async function loadNewConversation() {
      const newConvo = await createConversation(
        currentUser._id,
        currentNote._id
      );

      setLocalConvo(newConvo);
    }

    loadNewConversation();
  }, []);

  return (
    <div className="p-6 w-[85%]">
      <ChatBox convo={localConvo} />
    </div>
  );
};
