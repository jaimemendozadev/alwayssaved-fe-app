'use client';
import { ReactNode, useEffect} from 'react';
import { useRouter } from 'next/navigation';
import {Spinner} from "@heroui/react";

import { getUserFromDB } from '@/actions';

const errorMessage = "Looks like you might have never registered to AlwaysSaved. 😬 Try again later.";

export default function SignInCheckPage(): ReactNode {

  const router = useRouter();  

  useEffect(() => {
    async function checkUserRegistration() {
        const currentUser = await getUserFromDB()

        if(currentUser) {
            router.push('/home');
        }

        throw new Error(errorMessage);

    }

    checkUserRegistration();

  }, [router])


  return (
    <div className="flex justify-center">
      <Spinner />
    </div>
  );
}
