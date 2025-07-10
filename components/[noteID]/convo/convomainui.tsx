'use client';

import { LeanConversation } from '@/utils/mongodb';
import { ReactNode } from 'react';

interface ConvoMainUIProps {
  convos: LeanConversation[];
}

export const ConvoMainUI = ({ convos }: ConvoMainUIProps): ReactNode => {
  return <h1>ConvoMainUI Page</h1>;
};
