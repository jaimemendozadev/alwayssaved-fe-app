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
      </div>

      <main className="max-w-5/6 p-6 w-screen">{children}</main>
    </div>
  );
}
