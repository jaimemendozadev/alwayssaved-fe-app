'use client';
import { IUser } from "@/utils/mongodb"
import { useEffect, useState } from "react"
import { getUserFromDB } from '@/actions';

const errorMessage = "Looks like you might have never registered to AlwaysSaved. 😬 Try again later.";

export default function HomePage() {

    const [currentUser, setCurrentUser] = useState<IUser | null>(null);

    useEffect(() => {
        async function loadCurrentUser() {
            const currentUser = await getUserFromDB()
            
                    if(currentUser) {
                        setCurrentUser(currentUser);
                        return;
                    }
            
                    throw new Error(errorMessage);

        }

        loadCurrentUser();

    }, [])
    return (<div>
        <div className="w-5/6 bg-[#f9f9f9] min-h-screen">

        </div>

        <main className="w-5/6 p-3">

        </main>

        <h1>HomePage</h1>
    </div>)
}