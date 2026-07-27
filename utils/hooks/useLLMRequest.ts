import { useAuth } from '@clerk/nextjs';
import { HTTP_METHODS } from '../ts';
import { getSSMParam } from '@/actions/hooks/useLLMRequest';

const NODE_ENV = process.env.NODE_ENV;
const AWS_PARAM_BASE_PATH = process.env.NEXT_PUBLIC_AWS_PARAM_BASE_PATH;
const DEV_BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_DEVELOPMENT_BACKEND_BASE_URL;
const PROD_SSM_PARAM_NAME = `/${AWS_PARAM_BASE_PATH}/LLM_PRIVATE_IP`;

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

    // 7-27-26 TODO: Need to resolve having one single source for production.env variables.
    //               Either we copy the file in the image or created it at Terraform build time in bash script.

    console.log('NODE_ENV in useLLMRequest ', NODE_ENV);
    console.log('\n');

    baseURL =
      NODE_ENV === 'development'
        ? DEV_BACKEND_BASE_URL
        : await getSSMParam(PROD_SSM_PARAM_NAME);

    console.log('PROD_SSM_PARAM_NAME in useLLMRequest ', PROD_SSM_PARAM_NAME);
    console.log('\n');

    console.log('baseURL in useLLMRequest ', baseURL);
    console.log('\n');

    if (typeof baseURL !== 'string') {
      throw new Error(
        'BaseURL to connect and chat with LLM is missing in useLLMRequest. Try again later.'
      );
    }

    const finalizedURL = `${baseURL}/llm-api${endpoint}`;

    console.log('finalizedURL in useLLMRequest ', finalizedURL);
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
    console.log('\n');

    return res;
  };

  return {
    makeRequest
  };
};
