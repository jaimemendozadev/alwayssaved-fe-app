import { useAuth } from '@clerk/nextjs';
import { HTTP_METHODS } from '../ts';
const BACKEND_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? process.env.PRODUCTION_BACKEND_BASE_URL
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

    const res = await fetch(`${BACKEND_BASE_URL}/api${endpoint}`, {
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
