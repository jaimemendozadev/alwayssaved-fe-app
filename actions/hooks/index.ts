'use server';

export const getLLMBaseURL = async (): Promise<string | undefined> => {
  const LLM_BASE_URL = process.env.LLM_BASE_URL;

  return LLM_BASE_URL;
};
