'use server';
import { PipelineStage } from 'mongoose';
import {
  ConversationModel,
  deepLean,
  getObjectIDFromString,
  LeanConversation
} from '@/utils/mongodb';
import dayjs from 'dayjs';

export const matchProjectConversations = async (
  pipeline: PipelineStage[]
): Promise<LeanConversation[]> => {
  const foundNotes = await ConversationModel.aggregate(pipeline);

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

export const updateConversationByID = async (
  convoID: string,
  update: { [key: string]: unknown },
  options: { [key: string]: unknown } = {}
): Promise<LeanConversation> => {
  const updatedConvo = await ConversationModel.findByIdAndUpdate(
    getObjectIDFromString(convoID),
    update,
    options
  );

  if (!updatedConvo) {
    throw new Error(
      `There was a problem updating the Conversation ${convoID}. Try again later.`
    );
  }

  return deepLean(updatedConvo);
};

// See Dev Note #1 below.
export const deleteConvoByID = async (
  convoID: string
): Promise<LeanConversation> => {
  const _id = getObjectIDFromString(convoID);

  const deleteDate = new Date();

  const deleteUpdate = await ConversationModel.findOneAndUpdate(
    _id,
    { date_deleted: deleteDate },
    { returnDocument: 'after' }
  ).exec();

  console.log('deleteUpdate in deleteConvoByID ', deleteUpdate);
  console.log('\n');

  if (!deleteUpdate || deleteUpdate.date_deleted === null) {
    throw new Error(
      `There was a problem deleting the Conversation ${convoID}. Try again later`
    );
  }

  return deepLean(deleteUpdate);
};

/***************************
 * Notes
 ***************************

 1) Conversation documents are not
    hard deleted in the app. They're marked with
    date_deleted value in the document and will
    be removed from the database in a separate
    async job.

*/
