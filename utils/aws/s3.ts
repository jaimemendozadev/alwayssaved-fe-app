import { PutObjectCommand, S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const getConfigByEnv = (region: string, nodeEnv: string): S3ClientConfig => {

  if (nodeEnv === 'development') {

    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if(!accessKeyId || !secretAccessKey) {
      throw new Error("Missing environment variables in development to make s3 file upload. Cannot continue.")
    }

    return {
      region,
      credentials: { accessKeyId, secretAccessKey }
    };


  }


  return {
    region
  };
};

// See Note #1 below
export const createPresignedUrlWithClient = async (
  key: string,
  expiresIn: number = 3600
): Promise<string> => {
  // See Note #2 below
  const { NODE_ENV, AWS_REGION, AWS_BUCKET } = process.env;

  const envVarsValid =
    typeof AWS_REGION === 'string' && typeof AWS_BUCKET === 'string';

  if (!envVarsValid) {
    throw new Error(
      `Missing environment variables in ${NODE_ENV} to make s3 file upload. Cannot continue.`
    );
  }

  const config = getConfigByEnv(AWS_REGION, NODE_ENV);

  const client = new S3Client([config]); // See Note #2 below
  const command = new PutObjectCommand({ Bucket: AWS_BUCKET, Key: key });
  const signedUrl = await getSignedUrl(client, command, { expiresIn });

  return signedUrl;
};

/*************************************
 * Notes
 *************************************


1) createPresignedUrlWithClient works in "production" without aws credentials 
   if you attach a task role to the ecs task definition with access to s3.

   Code Source: 
   https://docs.aws.amazon.com/AmazonS3/latest/userguide/example_s3_Scenario_PresignedUrl_section.html

2) TODO: In production, need to decide how to set AWS_REGION & AWS_BUCKET variables. 🤔

*/
