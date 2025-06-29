import { getNotesForSideNav } from '@/actions/layout';
import { ReactNode } from 'react';

export default async function HomePageLayout({
  children
}: {
  children: ReactNode;
}): Promise<ReactNode> {
  const userNotes = await getNotesForSideNav();

  return (
    <div className="flex">
      <div className="w-[15%] bg-[#f9f9f9] min-h-screen p-4">
        <p className="text-[#919191]">Notes</p>
      </div>

      {children}
    </div>
  );
}
