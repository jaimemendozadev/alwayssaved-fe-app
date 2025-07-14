'use client';
import { ReactNode, useState } from 'react';
import { LeanConversation, LeanConvoMessage } from '@/utils/mongodb';
import { createContext, Dispatch, SetStateAction } from 'react';
import mongoose from 'mongoose';

export interface TempConvoMessage {
  conversation_id?: string | mongoose.Types.ObjectId;
  user_id?: string | mongoose.Types.ObjectId;
  date_sent?: Date;
  sender_type?: string; // "user" | "llm" | "system"
  llm_info?: {
    llm_company: string; // e.g., "OpenAI", "MistralAI"
    llm_model: string; // e.g., "gpt-4-turbo", "mistral-7b"
  };
  message?: string;
  is_pending?: boolean;
  is_thinking?: boolean;
  temp_id?: string;
}

interface ConvoContextShape {
  currentConvo: null | LeanConversation;
  convoThread: (LeanConvoMessage | TempConvoMessage)[];
  setCurrentConvo?: Dispatch<SetStateAction<LeanConversation | null>>;
  updateThread?: Dispatch<
    SetStateAction<(LeanConvoMessage | TempConvoMessage)[]>
  >;
}

export const ConvoContext = createContext<ConvoContextShape>({
  currentConvo: null,
  convoThread: []
});

export const ConvoProvider = ({
  children
}: {
  children: ReactNode;
}): ReactNode => {
  const [currentConvo, setCurrentConvo] = useState<null | LeanConversation>(
    null
  );
  const [convoThread, updateThread] = useState<
    (LeanConvoMessage | TempConvoMessage)[]
  >([]);

  return (
    <ConvoContext.Provider
      value={{ currentConvo, convoThread, setCurrentConvo, updateThread }}
    >
      {children}
    </ConvoContext.Provider>
  );
};
