'use client';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

interface NoFilesRedirectProps {
  noteID: string;
}

export const NoFilesRedirect = ({
  noteID
}: NoFilesRedirectProps): ReactNode => {
  const router = useRouter();

  useEffect(() => {
    toast.error(
      "You can't start a Chat Convo without attaching Files to your Note. You'll be redirect back to your Note page in a few seconds.",
      { duration: 6000 }
    );
    setTimeout(() => router.push(`/notes/${noteID}/edit`), 7000);
  }, [noteID, router]);

  return null;
};
