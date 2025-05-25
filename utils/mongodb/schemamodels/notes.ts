import mongoose from 'mongoose';
import { IUser } from './users';

export interface INote {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId | IUser;
  title: string;
  date_created: Date;
  date_deleted: Date | null;
//   files: []
}



export type LeanNote = Omit<INote, '_id' | 'user_id'> & {
    _id: string;
    user_id: string;
}

const {Schema, model} = mongoose;

const NoteSchema = new Schema<INote>({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: {type: String, default: `Untitled Note - ${new Date()}`},
    date_created: {type: Date, default: Date.now},
    date_deleted: { type: Date, default: null }, 
});

export const NoteModel = mongoose.models?.Note || model<INote>('Note', NoteSchema);
