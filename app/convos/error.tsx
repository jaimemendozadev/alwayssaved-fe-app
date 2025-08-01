'use client' // Error boundaries must be Client Components
import { ReactNode, useEffect } from 'react'
import {useRouter} from 'next/navigation';
import toast from 'react-hot-toast';


const duration = { duration: 6000 };
const toastMessage = "Something went wrong. 🥺 You'll be redirected to the landing page in a few seconds."
export default function ConvosErrorPage({
  error,
}: {
  error: Error & { digest?: string }
}):ReactNode {
  const router = useRouter();

  useEffect(() => {
    toast.error(toastMessage, duration);
    // TODO: Handle in telemetry.
    console.log("Error in ConvosPage: ", error);

    setTimeout(() => {
      router.push('/');
    }, 5000);
  }, [error, router])
 
  return null;
}