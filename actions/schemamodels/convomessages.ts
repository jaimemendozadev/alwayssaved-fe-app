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

export const getConversationMessages = async (convoID: string) => {
  const convoMessages = await ConvoMessageModel.find({
    conversation_id: getObjectIDFromString(convoID)
  }).exec();

  return deepLean(convoMessages);
};

export const deleteMessagesByConvoID = async (
  convoID: string
): Promise<void> => {
  const conversation_id = getObjectIDFromString(convoID);

  const deleteDate = new Date();

  const deleteRes = await ConvoMessageModel.updateMany(
    { conversation_id },
    { date_deleted: deleteDate }
  ).exec();

  console.log('deleteRes in deleteMessagesByConvoID ', deleteRes);
  console.log('\n');
};
