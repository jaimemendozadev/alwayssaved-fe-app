import mongoose from 'mongoose';
import { IUser } from './users';

import { LeanUser } from './users';
import { INote, LeanNote } from './notes';

export interface IConversation {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId | IUser;
  note_id: mongoose.Types.ObjectId | INote;
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
  date_started: { type: Date, default: Date.now },
  date_archived: { type: Date, default: null },
  date_deleted: { type: Date, default: null }
});

export const ConversationModel =
  mongoose.models?.File ||
  model<IConversation>('Conversation', ConversationSchema);
