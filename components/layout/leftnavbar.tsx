import { ReactNode } from 'react';
import Link from 'next/link';
import { SignOutButton } from '@clerk/nextjs';

/* 
  TODO: 
    - Create main /convo Page in the /app Folder that lists all the Conversations the User has in their account. 
*/
export const LeftNavbar = (): ReactNode => {
  return (
    <div className="max-w-1/6 min-h-screen border bg-[#f9f9f9] p-4">
      <div className="min-w-28 p-5 mb-2">
        <p className="text-[#919191] font-semibold mb-2">
          <Link href="/home">🏡 Home</Link>
        </p>
      </div>

      <div className="min-w-28 p-5">
        <p className="text-[#919191] font-semibold mb-2">
          <Link href="/notes">📝 Notes</Link>
        </p>
      </div>

      <div className="min-w-28 p-5">
        <p className="text-[#919191] font-semibold mb-2">
          <Link href="/convo">💬 Convos</Link>
        </p>
      </div>

      <div className="min-w-28 p-5">
        <div className="text-[#919191] font-semibold mb-2">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
};
