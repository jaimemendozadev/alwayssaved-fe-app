'use client';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Spinner } from '@heroui/react';
import { LeanUser } from '@/utils/mongodb';
import { registerNewUser } from '@/actions/onboard';
const successMessage =
  "Yay! 🥳 You've been registered to AlwaysSaved. Welcome aboard! 👋🏼";
const errorMessage =
  'Whoops! 😱 Looks like there was a problem registering you to AlwaysSaved. 🤦🏽 Try again later.';
const duration = { duration: 6000 };

export default function OnboardPage(): ReactNode {
  const router = useRouter();
  const [onboardedUser, setOnboardedUser] = useState<LeanUser | null>(null);

  useEffect(() => {
    async function getNewUser() {
      const newUser = await registerNewUser();

      if (newUser) {
        setOnboardedUser(newUser);
        toast.success(successMessage, duration);
        router.push('/home');
      }

      throw new Error(errorMessage);
    }

    getNewUser();
  }, [router]);

  return (
    <div className="flex justify-center">
      {onboardedUser === null && <Spinner />}
    </div>
  );
}
