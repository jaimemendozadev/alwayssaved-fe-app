'use client';
import { ReactNode, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Spinner } from '@heroui/react';

import { getUserFromDB } from '@/actions';

const errorMessage =
  'Looks like you might have never registered to AlwaysSaved. 😬 Try again later.';

const toastOptions = { duration: 6000 };

export default function SignInCheckPage(): ReactNode {
  const router = useRouter();

  useEffect(() => {
    async function checkUserRegistration() {
      const currentUser = await getUserFromDB();

      if (currentUser) {
        if (currentUser.cancel_date !== null) {
          toast.error(
            "It looks like you've deleted your account to AlwaysSaved. Register using a new email or Social Login.",
            toastOptions
          );
          setTimeout(() => {
            router.push('/');
          }, toastOptions.duration);
          return;
        }
        router.push('/home');
      }

      throw new Error(errorMessage);
    }

    checkUserRegistration();
  }, [router]);

  return (
    <div className="flex justify-center">
      <Spinner />
    </div>
  );
}
