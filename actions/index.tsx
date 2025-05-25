'use server';
import { dbConnect,} from '@/utils/mongodb';
import { currentUser } from '@clerk/nextjs/server';
import { UserModel, LeanUser } from '@/utils/mongodb';
import { createPresignedUrlWithClient } from '@/utils/aws/s3';

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


interface s3FileUploadArguments {
  payload: {
    fileName: string;
    fileOwner: string;
  };
}

// See Note #2 below
export async function s3FileUpload({ payload }: s3FileUploadArguments) {
  /* TODOs:

     [ ]: Create a MongoDB Note.
     [ ]: Create a MongoDB File.
     [ ]: Create an s3 Presigned Url for file.
    */

  /*
    Proposed s3 Key: 
    /{fileOwner}/{noteID}/{fileID}/{fileName}.{fileExtension}   
  */

  try {
    const { fileName, fileOwner } = payload;

    const key = `${fileOwner}/${noteID}/${fileID}/${fileName}`; // See Note #3 below

    const presignedUrl = await createPresignedUrlWithClient(key);
  } catch (error) {
    // TODO: Handle error in telemetry
    console.log('There was a problem s3FileUpload: ', error);
  }
}

/********************************************
 * Notes
 ********************************************



 2) If the presignedURL was created in the POST request, the PUT 
    request will update the RecipeAssets with the new URL. 

 3) Media assets are stored in s3 in the following s3 Key format: 

    /{fileOwner}/{noteID}/{fileID}/{fileName}.{fileExtension} 

    fileOwner: is the User._id
    fileName: is the name of the file with the fileType extension 



 From Extractor Service Dev Notes 5/10/25 (Extractor Notes need to be updated):

- Decided to organize media uploads and call each upload a "Note".
- If the Note is an .mp3 or .mp4, a Note is created for that file and it'll get uploaded on the Frontend to s3 at /{userID}/{noteID}/{fileName}.{fileExtension}
- When SQS messages arrives in Extractor service, will transcribe and upload the transcript to s3 at /{userID}/{noteID}/{fileName}.txt
- Incoming SQS Message has the following shape:
  {
     note_id: ObjectID;
     user_id: ObjectID;
     s3_key: string;
  }   

*/
