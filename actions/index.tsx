'use server';
import { dbConnect,} from '@/utils/mongodb';
import { currentUser } from '@clerk/nextjs/server';
import { UserModel, LeanUser } from '@/utils/mongodb';

import { getLeanUser } from '@/utils/mongodb/utils';
export const getUserFromDB = async (): Promise<LeanUser | void> => {
  await dbConnect();
    const clerkUser = await currentUser();

    if(clerkUser === null) {

        throw new Error("There was a problem getting the currently logged in user from Clerk. Can't continue the sign in process.");

    }

    const email = clerkUser.emailAddresses[0].emailAddress;


    const foundUser = await UserModel.findOne({email}).exec();

    if(!foundUser) {
        throw new Error(`No user with the email of ${email} exists in the database. Can't continue the sign in process.`);
    }

    console.log("foundUser in getUserFromDB ", foundUser);
    console.log("\n");

    return getLeanUser(foundUser);

};
