'use server';
import { ReactNode } from 'react';
import { getUserFromDB } from '@/actions';
import { ClientUI } from '@/components/settings';

export default async function SettingsPage(): Promise<ReactNode> {
  const currentUser = await getUserFromDB();

  if (!currentUser) {
    throw new Error(`There is no user authorized to access the app.`);
  }

  if (currentUser) {
    return <ClientUI currentUser={currentUser} />;
  }
  throw new Error('There was an error displaying the Settings Page.');
}
