import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';

export const sendSQSMessage = async () => {
  const EXTRACTOR_PUSH_QUEUE_URL = process.env.EXTRACTOR_PUSH_QUEUE_URL;

  if (!EXTRACTOR_PUSH_QUEUE_URL) {
    throw new Error(
      `Missing environment variable to start ML pipeline. Cannot continue.`
    );
  }

  const client = new SQSClient({});

  const command = new SendMessageCommand({
    QueueUrl: EXTRACTOR_PUSH_QUEUE_URL,
    DelaySeconds: 10, // Should we adjust? 🤔
    MessageBody:
      'Information about current NY Times fiction bestseller for week of 12/11/2016.'
  });

  const response = await client.send(command);
  console.log(response);
  return response;
};

/********************************************
 * Notes
 ********************************************

 1) Media assets are stored in s3 in the following s3 Key format: 

    /{fileOwner}/{noteID}/{fileID}/{fileName}.{fileExtension} 

    fileOwner: is the User._id
    fileName: is the name of the file with the fileType extension 

*/
