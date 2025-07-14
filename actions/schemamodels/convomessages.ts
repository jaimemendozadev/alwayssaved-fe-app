'use server';

import {
  ConvoMessageModel,
  deepLean,
  getObjectIDFromString,
  LeanConvoMessage
} from '@/utils/mongodb';

export const getConvoMessageByID = async (
  convoMsgID: string
): Promise<LeanConvoMessage> => {
  const foundMsg = await ConvoMessageModel.findById(
    getObjectIDFromString(convoMsgID)
  ).exec();

  if (!foundMsg) {
    throw new Error(`Can find the Conversation Message with ID ${convoMsgID}.`);
  }

  return deepLean(foundMsg);
};
