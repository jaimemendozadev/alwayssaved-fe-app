import mongoose, { UpdateQuery } from 'mongoose';

export interface IUser {
  _id: mongoose.Types.ObjectId;
  clerk_id: string;
  first_name: string;
  last_name: string;
  email: string;
  sign_up_date: Date;
  cancel_date: Date | null;
  avatar_url?: string | null;
}

export type LeanUser = Omit<IUser, '_id'> & {
  _id: string;
};

const { Schema, model } = mongoose;

const UserSchema = new Schema<IUser>({
  clerk_id: { type: String, required: true, unique: true },
  first_name: { type: String, required: true }, // Ensure first_name, last_name is always present
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // Enforce email uniqueness
  sign_up_date: { type: Date, default: Date.now },
  cancel_date: { type: Date, default: null },
  avatar_url: { type: String, default: null }
});

// Middleware to sanitize empty strings
UserSchema.pre('save', function (next) {
  if (this.avatar_url === '') this.avatar_url = null;
  next();
});

// Middleware for updates to handle empty strings
UserSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as UpdateQuery<IUser>; // Cast update to IUser schema

  if (update && update.avatar_url === '') update.avatar_url = null;
  next();
});

export const UserModel =
  mongoose.models?.User || model<IUser>('User', UserSchema);
