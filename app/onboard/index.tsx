'use client';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {Spinner} from "@heroui/react";
import { IUser } from '@/utils/mongodb';
import { registerNewUser } from '@/actions/onboard';

const successMessage = "Yay! 🥳 You've been registered to AlwaysSaved. Welcome board! 👋🏼";
const errorMessage = "Whoops! 😱 Looks like there was a problem registering you to AlwaysSaved. 🤦🏽 Try again later.";
const duration = { duration: 5000 };

export default function Onboard(): ReactNode {

  const router = useRouter();  
  const [onboardedUser, setOnboardedUser] = useState<IUser | null>(null)

  useEffect(() => {
    async function getNewUser() {
        const newUser = await registerNewUser()

        if(newUser) {
            setOnboardedUser(newUser);
            toast.success(successMessage, duration);
            router.push('/home');
        }

        toast.error(errorMessage, duration)


    }

    getNewUser();

  }, [router])


  return (
    <div className="flex justify-center">
        {onboardedUser === null && <Spinner />}
    </div>
  );
}
