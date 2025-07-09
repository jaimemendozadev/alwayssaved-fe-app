import mongoose from 'mongoose';
import { IUser } from './users';

import { LeanUser } from './users';
import { INote, LeanNote } from './notes';

export interface IConversation {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId | IUser;
  note_id: mongoose.Types.ObjectId | INote;
  title: string;
  date_started: Date;
  date_archived: Date | null;
  date_deleted: Date | null;
}

export type LeanConversation = Omit<IConversation, '_id' | 'user_id'> & {
  _id: string;
  user_id: string | LeanUser;
  note_id: string | LeanNote;
};

const { Schema, model } = mongoose;

const ConversationSchema = new Schema<IConversation>({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' },
  title: { type: String, default: `Untitled Conversation - ${new Date()}` },
  date_started: { type: Date, default: Date.now },
  date_archived: { type: Date, default: null },
  date_deleted: { type: Date, default: null }
});

export const ConversationModel =
  mongoose.models?.Conversation ||
  model<IConversation>('Conversation', ConversationSchema);
