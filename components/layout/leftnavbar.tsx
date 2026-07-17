import { ReactNode } from 'react';
import Link from 'next/link';
import { SignOutButton } from '@clerk/nextjs';

export const LeftNavbar = (): ReactNode => {
  return (
    <div className="max-w-1/6 min-h-screen border bg-[#f9f9f9] p-4">
      <div className="min-w-28 p-5 mb-2 w-36">
        <p className="text-[#919191] font-semibold">
          <Link href="/home">🏡 Home</Link>
        </p>
      </div>

      <div className="min-w-28 p-5 mb-2 w-36">
        <p className="text-[#919191] font-semibold">
          <Link href="/notes">📝 Notes</Link>
        </p>
      </div>

      <div className="min-w-28 p-5 mb-2 w-36">
        <p className="text-[#919191] font-semibold">
          <Link href="/convos">💬 Convos</Link>
        </p>
      </div>

      <div className="min-w-28 p-5 mb-2 w-36">
        <p className="text-[#919191] font-semibold">
          <Link href="/settings">⚙️ Settings</Link>
        </p>
      </div>

      <div className="min-w-28 p-5 w-36">
        <div className="text-[#919191] font-semibold">
          <SignOutButton redirectUrl='/' />
        </div>
      </div>
    </div>
  );
};
