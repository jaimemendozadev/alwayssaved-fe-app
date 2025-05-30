'use server';
import { dbConnect, UserModel, LeanUser, deepLean } from '@/utils/mongodb';
import { currentUser } from '@clerk/nextjs/server';

export const registerNewUser = async (): Promise<LeanUser | void> => {
  await dbConnect();
  const clerkUser = await currentUser();

  if (clerkUser === null) {
    throw new Error(
      "There was a problem registering the new user in Clerk. Can't continue the onboarding process."
    );
  }

  const first_name = clerkUser?.firstName || '';

  const last_name = clerkUser?.lastName || '';

  const email = clerkUser.emailAddresses[0].emailAddress;

  const avatar_url = clerkUser?.imageUrl || null;

  const payload = {
    first_name,
    last_name,
    email,
    avatar_url
  };

  const [newUser] = await UserModel.create([payload], { j: true });

  return deepLean(newUser);
};
