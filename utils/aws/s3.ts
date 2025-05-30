import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getAWSConfigByEnv } from '.';

// See Note #1 below
const { NODE_ENV, AWS_BUCKET } = process.env;

const config = getAWSConfigByEnv(NODE_ENV);

const client = new S3Client([config]);

// See Note #1 below
export const createPresignedUrlWithClient = async (
  key: string,
  expiresIn: number = 3600
): Promise<string> => {
  const command = new PutObjectCommand({ Bucket: AWS_BUCKET, Key: key });
  const signedUrl = await getSignedUrl(client, command, { expiresIn });

  return signedUrl;
};

/*************************************
 * Notes
 *************************************


1) TODO: In production, need to decide how to set AWS_REGION & AWS_BUCKET variables. 🤔

2) createPresignedUrlWithClient works in "production" without aws credentials 
   if you attach a task role to the ecs task definition with access to s3.

   Code Source: 
   https://docs.aws.amazon.com/AmazonS3/latest/userguide/example_s3_Scenario_PresignedUrl_section.html

*/
