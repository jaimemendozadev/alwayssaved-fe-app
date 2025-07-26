import { useAuth } from '@clerk/nextjs';
import { HTTP_METHODS } from '../ts';
const BACKEND_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_BACKEND_BASE_URL
    : process.env.NEXT_PUBLIC_DEVELOPMENT_BACKEND_BASE_URL;

interface MakeRequestOptions {
  headers?: unknown;
  body?: unknown;
  method?: HTTP_METHODS;
}

export const useBackendRequest = () => {
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

    console.log("BACKEND_BASE_URL in makeRequest ", BACKEND_BASE_URL);
    console.log("\n");

    const finalizedURL = `${BACKEND_BASE_URL}/api${endpoint}`;

    console.log("finalizedURL ", finalizedURL);
    console.log("\n");

    const res = await fetch(finalizedURL, {
      method: options.method || 'GET',
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    }).then((res) => res.json());

    console.log('res in useBackendRequest ', res);

    return res;
  };

  return {
    makeRequest
  };
};
