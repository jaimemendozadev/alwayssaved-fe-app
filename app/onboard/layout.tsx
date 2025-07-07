'use server';
import { ReactNode } from 'react';
import { LeftNavbar } from '@/components/layout';

export default async function CommonPageLayout({
  children
}: {
  children: ReactNode;
}): Promise<ReactNode> {
  return (
    <div className="flex">
      <LeftNavbar />

      <main className="max-w-5/6 p-6 w-screen">{children}</main>
    </div>
  );
}
