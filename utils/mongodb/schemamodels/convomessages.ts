import mongoose from 'mongoose';
import { IUser } from './users';

import { LeanUser } from './users';
import { IConversation, LeanConversation } from './conversations';
import { INote, LeanNote } from './notes';

export interface IConvoMessage {
  _id: mongoose.Types.ObjectId;
  conversation_id: mongoose.Types.ObjectId | IConversation;
  user_id?: mongoose.Types.ObjectId | IUser;
  note_id?: mongoose.Types.ObjectId | INote;
  date_sent: Date;
  date_archived: Date | null;
  date_deleted: Date | null;
  sender_type: string; // "user" | "llm" | "system"
  llm_info?: {
    llm_company: string; // e.g., "OpenAI", "MistralAI"
    llm_model: string; // e.g., "gpt-4-turbo", "mistral-7b"
  };
  message: string;
}

export type LeanConvoMessage = Omit<
  IConvoMessage,
  '_id' | 'conversation_id' | 'user_id' | 'note_id'
> & {
  _id: string;
  conversation_id: string | LeanConversation;
  user_id: string | LeanUser;
  note_id: string | LeanNote;
};

const { Schema, model } = mongoose;

const ConvoMessageSchema = new Schema<IConvoMessage>({
  conversation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation'
  },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' },
  date_sent: { type: Date, default: Date.now },
  date_archived: { type: Date, default: null },
  date_deleted: { type: Date, default: null },
  sender_type: { type: String, required: true },
  llm_info: {
    type: {
      llm_company: { type: String },
      llm_model: { type: String }
    },
    required: false,
    default: undefined
  },
  message: { type: String, required: true }
});

export const ConvoMessageModel =
  mongoose.models?.ConvoMessage ||
  model<IConvoMessage>('ConvoMessage', ConvoMessageSchema);
