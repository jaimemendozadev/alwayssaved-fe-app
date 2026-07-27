'use client';
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dayjs from 'dayjs';

import { LeanUser, LeanFile } from '@/utils/mongodb';

interface ClientUIProps {
  userFiles: LeanFile[];
  currentUser: LeanUser;
}

const toastOptions = { duration: 6000 };

export const ClientUI = ({
  userFiles,
  currentUser
}: ClientUIProps): ReactNode => {
  const router = useRouter();

  if (!currentUser) return null;

  return (
    <div>
      <h1 className="text-3xl lg:text-6xl mb-16">
        📝 {currentUser?.first_name}&#39;s Files
      </h1>

      {userFiles.length > 0 && (
        <ul className="space-y-7">
          {userFiles.map((userFile) => {
            return (
              <li className="border-2 p-5" key={userFile._id}>
                File Name: {userFile.file_name} &nbsp; | &nbsp; File Type:{' '}
                {userFile.file_type} &nbsp; | &nbsp; Date Uploaded:{' '}
                {dayjs(userFile.date_uploaded).format('dddd, MMMM D, YYYY')}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
