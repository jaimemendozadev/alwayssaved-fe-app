'use server';

import { getSecret } from "@/utils/aws";


export const getSSMParam = async (paramStr: string): Promise<string | null> => {
  const ssmSecret = await getSecret(paramStr);

  return ssmSecret;

}