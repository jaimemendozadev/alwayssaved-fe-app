import mongoose from 'mongoose';
import dayjs from 'dayjs';
import { IUser } from './users';
import { INote } from './notes';

import { LeanUser } from './users';
import { LeanNote } from './notes';

export interface IFile {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId | IUser;
  note_id: mongoose.Types.ObjectId | INote;
  s3_key: string | null;
  file_name: string;
  file_type: string;
  date_uploaded: Date;
  date_deleted: Date | null;
}

export type LeanFile = Omit<IFile, '_id' | 'user_id' | 'note_id'> & {
  _id: string;
  user_id: string | LeanUser;
  note_id: string | LeanNote;
};

const { Schema, model } = mongoose;

const FileSchema = new Schema<IFile>({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' },
  s3_key: { type: String, default: null },
  file_name: {
    type: String,
    required: true,
    default: `Untitled File - ${dayjs().format('dddd, MMMM D, YYYY h:mm A')}`
  },
  file_type: { type: String, required: true, default: 'Unknown Type' },
  date_uploaded: { type: Date, default: Date.now },
  date_deleted: { type: Date, default: null }
});

FileSchema.pre('save', function (next) {
  if (this.file_type === '') this.file_type = 'Unknown Type';
  next();
});

export const FileModel =
  mongoose.models?.File || model<IFile>('File', FileSchema);
