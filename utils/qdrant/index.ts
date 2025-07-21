import { QdrantClient } from '@qdrant/js-client-rest';
import { getSecret } from '../aws';

const { AWS_PARAM_BASE_PATH } = process.env;

export const getQdrantDB = async (): Promise<QdrantClient> => {
  const hostURL = await getSecret(`/${AWS_PARAM_BASE_PATH}/QDRANT_URL`);
  const apiKey = await getSecret(`/${AWS_PARAM_BASE_PATH}/QDRANT_API_KEY`);

  if (!hostURL || !apiKey) {
    throw new Error(
      'Missing URL to API Key for establishing Qdrant database connection.'
    );
  }

  const qdrantClient = new QdrantClient({
    url: hostURL,
    apiKey: apiKey
  });

  return qdrantClient;
};
