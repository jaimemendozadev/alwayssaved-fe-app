'use server';
import {
  ConversationModel,
  deepLean,
  getObjectIDFromString,
  LeanConversation
} from '@/utils/mongodb';
import dayjs from 'dayjs';
interface SpecifiedConvoFields {
  _id?: number;
  user_id?: number;
  note_id?: number;
  title?: number;
  date_started?: number;
  date_archived?: number;
  date_deleted?: number;
}

interface ConvoMatch {
  _id?: unknown;
  user_id?: unknown;
  note_id?: unknown;
  title?: unknown;
  date_started?: unknown;
  date_archived?: unknown;
  date_deleted?: unknown;
}

export const matchProjectConversations = async (
  match: ConvoMatch,
  projectFields: SpecifiedConvoFields
): Promise<LeanConversation[]> => {
  const foundNotes = await ConversationModel.aggregate([
    { $match: match },
    { $project: projectFields }
  ]);

  return deepLean(foundNotes);
};

export const createConversation = async (
  userID: string,
  noteID: string
): Promise<LeanConversation> => {
  const convoPayload = {
    user_id: getObjectIDFromString(userID),
    note_id: getObjectIDFromString(noteID),
    title: `New Convo - ${dayjs().format('dddd, MMMM D, YYYY h:mm A')}`,
    date_started: Date.now()
  };

  const [newConvo] = await ConversationModel.create([convoPayload], {
    j: true
  });

  return deepLean(newConvo);
};
