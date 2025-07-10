'use server';
import { ConversationModel, deepLean, LeanConversation } from '@/utils/mongodb';
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
