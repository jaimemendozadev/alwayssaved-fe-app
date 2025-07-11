import { HTTP_METHODS } from './ts';

export const makeBackEndRequest = async <T>(
  apiURL: string,
  method: HTTP_METHODS,
  bodyPayload: { [key: string]: any } = {}
): Promise<T | void> => {
  try {
    if (method === 'GET') {
      const result = await fetch(apiURL).then((res) => res.json());
      return result;
    }

    const payload = {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload)
    };

    const result = await fetch(apiURL, payload).then((res) => res.json());

    return result;
  } catch (error) {
    // TODO: Handle in telemetry
    console.log(
      `There was an error making a Backend API request to ${apiURL}: `,
      error
    );
  }

  return undefined;
};
