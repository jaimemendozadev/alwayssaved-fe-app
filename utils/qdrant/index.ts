import { QdrantClient } from '@qdrant/js-client-rest';
import { getSecret } from '../aws';

export const getQdrantDB = async () => {
  const hostURL = await getSecret('/alwayssaved/QDRANT_URL');
  const apiKey = await getSecret('/alwayssaved/QDRANT_API_KEY');

  if (!hostURL || !apiKey) {
    throw new Error(
      'Missing URL to API Key for establishing Qdrant database connection.'
    );
  }

  const qdrantClient = new QdrantClient({
    host: hostURL,
    apiKey: apiKey
  });

  return qdrantClient;
};
