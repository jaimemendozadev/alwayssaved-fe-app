'use client';
import { ReactNode } from 'react';

import { LeanUser } from '@/utils/mongodb';

interface ClientUIProps {
  currentUser: LeanUser;
}

export const ClientUI = ({ currentUser }: ClientUIProps): ReactNode => {
  console.log('currentUser in Settings Page ', currentUser);

  return (
    <div>
      <h1>⚙️ Settings Page</h1>
    </div>
  );
};
