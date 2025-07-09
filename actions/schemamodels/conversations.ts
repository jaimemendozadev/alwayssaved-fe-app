'use server';

import { ConversationModel, getObjectIDFromString } from '@/utils/mongodb';

export const getActiveUserConvos = async (userID: string, noteID) => {
  const convoResult = await ConversationModel.find({
    user_id: getObjectIDFromString(userID),
    note_id: getObjectIDFromString(noteID),
    date_deleted: { $eq: null },
    date_archived: { $eq: null }
  }).exec();

  console.log('convoResult in getUserConvos ', convoResult);
};
