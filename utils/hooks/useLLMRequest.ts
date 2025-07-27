import { useAuth } from '@clerk/nextjs';
import { HTTP_METHODS } from '../ts';
import { getSecret } from '../aws';

const NODE_ENV = process.env.NODE_ENV;
const AWS_PARAM_BASE_PATH = process.env.NEXT_PUBLIC_AWS_PARAM_BASE_PATH;

interface MakeRequestOptions {
  headers?: unknown;
  body?: unknown;
  method?: HTTP_METHODS;
}

export const useLLMRequest = () => {
  const { getToken } = useAuth();

  const makeRequest = async <T>(
    endpoint: string,
    options: MakeRequestOptions = {}
  ): Promise<T | void> => {
    const token = await getToken();

    const defaultHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };

    let baseURL: string | null | undefined = undefined;

    baseURL =
      NODE_ENV === 'development'
        ? process.env.NEXT_PUBLIC_DEVELOPMENT_BACKEND_BASE_URL
        : await getSecret(`/${AWS_PARAM_BASE_PATH}/LLM_PRIVATE_IP`);

    console.log('baseURL in Hook ', baseURL);
    console.log('\n');

    if (typeof baseURL !== 'string') {
      throw new Error(
        'BaseURL to connect and chat with LLM is missing in useLLMRequest. Try again later.'
      );
    }

    const finalizedURL = `${baseURL}:8000/api${endpoint}`;

    console.log('finalizedURL ', finalizedURL);
    console.log('\n');

    const res = await fetch(finalizedURL, {
      method: options.method || 'GET',
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    }).then((res) => res.json());

    console.log('res in useLLMRequest ', res);

    return res;
  };

  return {
    makeRequest
  };
};
