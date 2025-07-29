'use client';
import { ReactNode } from 'react';
import dayjs from 'dayjs';
import { Avatar, Card, CardBody, CardHeader } from '@heroui/react';
import { LeanUser } from '@/utils/mongodb';

interface ClientUIProps {
  currentUser: LeanUser;
}

export const ClientUI = ({ currentUser }: ClientUIProps): ReactNode => {
  console.log('currentUser in Settings Page ', currentUser);
  const { first_name, last_name, email, avatar_url, sign_up_date } =
    currentUser;
  const fullName = `${first_name} ${last_name}`;
  const avatarSrc =
    avatar_url === null || avatar_url === '' ? undefined : avatar_url;

  const dateJoined = dayjs(sign_up_date).format('M/D/YYYY');

  return (
    <div className="p-2">
      <h1 className="text-3xl lg:text-6xl mb-16">⚙️ Settings Page</h1>

      <Card className="max-w-[300px]">
        <CardHeader>
          <Avatar src={avatarSrc} />
        </CardHeader>
        <CardBody>
          <h2 className="text-xl font-semibold mb-2">Account</h2>
          <p className="mb-2">
            <span className="font-semibold">Email</span>: {email}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Name</span>: {fullName}
          </p>
          <p>
            <span className="font-semibold">Date Joined</span>: {dateJoined}
          </p>
        </CardBody>
      </Card>
    </div>
  );
};
