import {
  GetParameterCommand,
  SSMClient,
  SSMServiceException
} from '@aws-sdk/client-ssm';

const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

const ssmClient = new SSMClient({ region: AWS_REGION });

export const getSecret = async (paramName: string): Promise<string | null> => {
  try {
    const command = new GetParameterCommand({
      Name: paramName,
      WithDecryption: true
    });

    const response = await ssmClient.send(command);

    return response.Parameter?.Value || null;
  } catch (error) {
    if (
      error instanceof SSMServiceException &&
      error.name === 'ParameterNotFound'
    ) {
      console.error(`❌ ParameterNotFound: ${paramName}`);
    } else if (
      error instanceof SSMServiceException &&
      error.$metadata?.httpStatusCode === 400
    ) {
      console.error(`❌ Bad Request: ${error.message}`);
    } else if (error instanceof Error) {
      console.error(`❌ Unexpected error in getSecret: ${error.message}`);
    } else {
      console.error(`❌ Unexpected error in getSecret: ${error}`);
    }
  }

  return null;
};
