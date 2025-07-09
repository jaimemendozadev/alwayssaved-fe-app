import mongoose from 'mongoose';
import { IUser } from './users';

import { LeanUser } from './users';
import { IConversation, LeanConversation } from './conversations';

export interface IConvoMessage {
  _id: mongoose.Types.ObjectId;
  conversation_id: mongoose.Types.ObjectId | IConversation;
  user_id?: mongoose.Types.ObjectId | IUser;
  date_sent: Date;
  sender_type: string;
  message: string;
}

export type LeanConvoMessage = Omit<IConvoMessage, '_id' | 'conversation_id' | 'user_id'> & {
  _id: string;
  conversation_id: string | LeanConversation;
  user_id: string | LeanUser;
};

const { Schema, model } = mongoose;

const ConvoMessageSchema = new Schema<IConvoMessage>({
  conversation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },  
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date_sent: {type: Date, default: Date.now},
  sender_type: {type: String, required: true},
  message: {type: String, required: true},
});


export const ConvoMessageModel =
  mongoose.models?.ConvoMessage || model<IConvoMessage>('ConvoMessage', ConvoMessageSchema);
