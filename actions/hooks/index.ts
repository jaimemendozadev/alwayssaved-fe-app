'use server';

export const getLLMBaseURL = (): string | undefined => {
  const LLM_BASE_URL = process.env.LLM_BASE_URL;

  return LLM_BASE_URL;
};
