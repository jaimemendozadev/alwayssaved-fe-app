'use server';
import { getNotesForSideNav } from '@/actions/layout';
import { ReactNode } from 'react';
import Link from 'next/link';

export default async function CommonPageLayout({
  children
}: {
  children: ReactNode;
}): Promise<ReactNode> {
  const userNotes = await getNotesForSideNav();

  return (
    <div className="flex">
      <div className="w-[15%] bg-[#f9f9f9] min-h-screen p-4">
        <p className="text-[#919191] mb-2">Notes</p>
        {userNotes.map((noteDoc) => (
          <Link key={noteDoc._id} href={`/notes/${noteDoc._id}`}>
            {noteDoc.title}
          </Link>
        ))}
      </div>

      {children}
    </div>
  );
}
