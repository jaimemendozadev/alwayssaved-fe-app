'use client';
import { ReactNode, useEffect, useState } from 'react';
import {Spinner} from "@heroui/react";
import { IUser } from '@/utils/mongodb';
import { registerNewUser } from '@/actions/onboard';


export default function Onboard(): ReactNode {

  const [onboardedUser, setOnboardedUser] = useState<IUser | null>(null)

  useEffect(() => {
    async function getNewUser() {
        const newUser = await registerNewUser()

        if(newUser) {
            setOnboardedUser(newUser);
        }


    }

    getNewUser();

  }, [])


  return (
    <div className="flex justify-center">
        {onboardedUser === null && <Spinner />}
    </div>
  );
}
