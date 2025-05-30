import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";

const AWS_REGION = process.env.AWS_REGION || "us-east-1";

const ssmClient = new SSMClient({ region: AWS_REGION });

export const getSecret = async (paramName: string): Promise<string | null> => {
  try {
    const command = new GetParameterCommand({
      Name: paramName,
      WithDecryption: true,
    });

    const response = await ssmClient.send(command);
    return response.Parameter?.Value || null;

  } catch (error: any) {
    if (error.name === "ParameterNotFound") {
      console.error(`❌ ParameterNotFound: ${paramName}`);
    } else if (error?.$metadata?.httpStatusCode === 400) {
      console.error(`❌ Bad Request: ${error.message}`);
    } else {
      console.error(`❌ Unexpected error in getSecret: ${error.message || error}`);
    }
    
  }

  return null;
};
