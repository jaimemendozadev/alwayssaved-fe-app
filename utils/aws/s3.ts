'use server';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getAWSConfigByEnv } from './index';

const { NODE_ENV, AWS_BUCKET } = process.env;

// See Note #1 below
export const handlePresignedUrlsWithClient = async (
  key: string,
  expiresIn: number = 3600
): Promise<string> => {
  const config = getAWSConfigByEnv(NODE_ENV);

  const client = new S3Client(config);

  const command = new PutObjectCommand({ Bucket: AWS_BUCKET, Key: key });
  const signedUrl = await getSignedUrl(client, command, { expiresIn });

  return signedUrl;
};

/*************************************
 * Notes
 *************************************


1) handlePresignedUrlsWithClient works in "production" without aws credentials 
   if you attach a task role to the ecs task definition with access to s3.

   Code Source: 
   https://docs.aws.amazon.com/AmazonS3/latest/userguide/example_s3_Scenario_PresignedUrl_section.html


 2) Media assets are stored in s3 in the following s3_key format: 

    /{fileOwner}/{noteID}/{fileID}/{fileName}.{fileExtension} 

    fileOwner: is the User._id
    fileName: is the name of the file with the fileType extension 


*/
