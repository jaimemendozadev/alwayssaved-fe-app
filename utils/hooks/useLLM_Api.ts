import { useAuth } from "@clerk/nextjs";


const LLM_BASE_URL = process.env.NEXT_PUBLIC_LLM_BASE_URL;

console.log("LLM_BASE_URL ", LLM_BASE_URL);

export const useLLM_Api = () => {
  const {getToken} = useAuth();

  const makeLLM_Request = async(endpoint: string, options: {[key: string]: any}):Promise<any> => {

    const token = await getToken();

    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    }

    const res = await fetch(`${LLM_BASE_URL}/${endpoint}`, {
      ...defaultOptions,
      ... options
    })

    console.log("res in makeLLM_Request: ", res);
  }

  return {
    makeLLM_Request
  }

}
