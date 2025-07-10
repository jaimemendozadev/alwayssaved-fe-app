'use client';
import { ReactNode } from 'react';
import { ChatBox } from '@/components/chatbox';

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
  return (
    <div className="p-6 w-[85%]">
      <ChatBox />
    </div>
  );
};
