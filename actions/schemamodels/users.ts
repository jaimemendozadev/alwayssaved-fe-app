'use server';

import {
  deepLean,
  getObjectIDFromString,
  LeanUser,
  UserModel
} from '@/utils/mongodb';

export const deleteUserAccount = async (userID: string): Promise<LeanUser> => {
  const targetID = getObjectIDFromString(userID);
  const deletedUser = await UserModel.findByIdAndUpdate(
    targetID,
    { cancel_date: new Date() },
    {
      returnDocument: 'after'
    }
  ).exec();

  if (!deletedUser || deletedUser.date_deleted === null) {
    throw new Error(
      `There was a problem deleting the account for User ${userID}. Try again later.`
    );
  }

  return deepLean(deletedUser);
};
