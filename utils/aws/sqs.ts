import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { getAWSConfigByEnv } from '.';
import { getSecret } from './ssm';
import { sqsMsgBody } from '@/components/fileupload/utils';

const { NODE_ENV } = process.env;

const config = getAWSConfigByEnv(NODE_ENV);

const client = new SQSClient([config]);

interface sqsMessage {
  user_id: string;
  media_uploads: sqsMsgBody[]
}
export const sendSQSMessage = async (sqsMessage: sqsMessage): Promise<void> => {
  const EXTRACTOR_PUSH_QUEUE_URL = await getSecret('EXTRACTOR_PUSH_QUEUE_URL');

  if (!EXTRACTOR_PUSH_QUEUE_URL) {
    throw new Error(
      `Missing environment variable to start ML pipeline. Cannot continue.`
    );
  }

  const MessageBody = JSON.stringify(sqsMessage)

  const command = new SendMessageCommand({
    QueueUrl: EXTRACTOR_PUSH_QUEUE_URL,
    DelaySeconds: 10, // Should we adjust? 🤔
    MessageBody
  });

  const response = await client.send(command);

  console.log("sendSQSMessage response: ", response);
  
};

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
