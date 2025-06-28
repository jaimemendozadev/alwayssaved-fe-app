import { useAuth } from '@clerk/nextjs';

const LLM_BASE_URL = process.env.NEXT_PUBLIC_LLM_BASE_URL;

export const useLLM_Api = () => {
  const { getToken } = useAuth();

  const makeLLM_Request = async (
    endpoint: string,
    options: { [key: string]: any } = {}
  ) => {
    const token = await getToken();

    const defaultHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };

    const res = await fetch(`${LLM_BASE_URL}/api${endpoint}`, {
      method: options.method || 'GET',
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    console.log('res in makeLLM_Request ', res);

    return res.json();
  };

  return {
    makeLLM_Request
  };
};
