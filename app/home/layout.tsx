'use server';
import { ReactNode } from 'react';
import Link from 'next/link';

export default async function CommonPageLayout({
  children
}: {
  children: ReactNode;
}): Promise<ReactNode> {

  return (
    <div className="flex">
      <div className="w-[15%] bg-[#f9f9f9] min-h-screen p-5">
        <p className="text-[#919191] font-semibold mb-2"><Link href="/notes">📝 Notes</Link></p>
      </div>

      {children}
    </div>
  );
}
