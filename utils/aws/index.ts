export * from './s3';
export * from './sqs';
export * from './ssm'

type AWSClientConfig = {
  region: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
};

export const getAWSConfigByEnv = (nodeEnv: string): AWSClientConfig => {

  const region = process.env.AWS_REGION || 'us-east-1';  

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