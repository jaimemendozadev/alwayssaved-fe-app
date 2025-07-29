'use server';
import { dbConnect } from '@/utils/mongodb';
import { currentUser } from '@clerk/nextjs/server';
import { UserModel, LeanUser } from '@/utils/mongodb';
import { deepLean } from '@/utils/mongodb/utils';
export const getUserFromDB = async (): Promise<LeanUser | void> => {
  
  const clerkUser = await currentUser();

  await dbConnect();

  if (clerkUser === null) {
    throw new Error(
      "There was a problem getting the currently logged in user from Clerk. Can't continue the sign in process."
    );
  }

  const email = clerkUser.emailAddresses[0].emailAddress;

  const foundUser = await UserModel.findOne({ email }).exec();

  if (!foundUser) {
    throw new Error(
      `No user with the email of ${email} exists in the database. Can't allow the user to access the app.`
    );
  }


  return deepLean(foundUser);
};
