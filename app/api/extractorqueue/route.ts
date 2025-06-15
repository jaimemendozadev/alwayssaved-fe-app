import { NextResponse, NextRequest } from 'next/server';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { currentUser } from '@clerk/nextjs/server';
import { getAWSConfigByEnv, getSecret } from '@/utils/aws';

const { NODE_ENV } = process.env;

export async function POST(request: NextRequest): Promise<void | Response> {
  const user = await currentUser();

  if (!user)
    return NextResponse.json(
      { message: "You're not authorized to make this request." },
      { status: 401 }
    );

  const body = await request.json();

   const { note_id, user_id, s3_key } = body;

  try {
    const EXTRACTOR_PUSH_QUEUE_URL = await getSecret(
      'EXTRACTOR_PUSH_QUEUE_URL'
    );

    if (!EXTRACTOR_PUSH_QUEUE_URL) {
      throw new Error(
        `Missing environment variable to start ML pipeline. Cannot continue.`
      );
    }

    const sqs_message = {
      user_id,
      media_uploads: [{
        note_id,
        user_id,
        s3_key
      }]
    };

    const MessageBody = JSON.stringify(sqs_message);

    const command = new SendMessageCommand({
      QueueUrl: EXTRACTOR_PUSH_QUEUE_URL,
      DelaySeconds: 10, // Should we adjust? 🤔
      MessageBody
    });

    const config = getAWSConfigByEnv(NODE_ENV);

    const client = new SQSClient(config);

    const response = await client.send(command);

    console.log('sendSQSMessage response: ', response);

    return NextResponse.json(
      {
        status: 200,
        message: `Your SQS Extractor message for ${s3_key} has been sent! 🥳`
      },
      { status: 200 }
    );
  } catch (error) {
    // TODO: Handle in telemetry.
    console.log('Error in POST /api/extractorqueue ', error);
    return NextResponse.json(
      {
        status: 500,
        message: `There was a problem sending your SQS Extractor message for ${s3_key}. Try again later. 😬`
      },
      { status: 500 }
    );
  }
}

/********************************************
 * Notes
 ********************************************

 1) Media assets are stored in s3 in the following s3_key format: 

    /{fileOwner}/{noteID}/{fileID}/{fileName}.{fileExtension} 

    fileOwner: is the User._id
    fileName: is the name of the file with the fileType extension 


 2) Outgoing SQS Message to EXTRACTOR_PUSH_QUEUE has MessageBody:

    [ 
      {
       s3_key: string;
       note_id: string;
       user_id: string;
      }
    ]
*/
