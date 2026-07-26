'use server';
import { ReactNode } from 'react';
import { Spinner } from '@heroui/react';
import { getUserFromDB } from '@/actions';

export default async function FilesPage(): Promise<ReactNode> {
  const currentUser = await getUserFromDB();

  console.log('currentUser in FilesPage ', currentUser);
  console.log('\n');

  if (!currentUser) {
    return (
      <div className="p-6 w-[85%]">
        <div className="w-auto h-screen flex justify-center">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>🗄️ Files Page</h1>
    </div>
  );
}
