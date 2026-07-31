'use client';
import { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

import { LeanUser, LeanFile } from '@/utils/mongodb';
import { getFileDownloadUrl } from '@/actions/schemamodels/files';

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
  const [downloadingFileID, setDownloadingFileID] = useState<string | null>(
    null
  );

  if (!currentUser) return null;

  const handleFileDownload = async (fileID: string): Promise<void> => {
    setDownloadingFileID(fileID);

    try {
      const downloadUrl = await getFileDownloadUrl(fileID);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error in handleFileDownload: ', error);
      toast.error(
        'There was a problem downloading your File. Try again later. 😬',
        toastOptions
      );
    } finally {
      setDownloadingFileID(null);
    }
  };

  return (
    <div>
      <h1 className="text-3xl lg:text-6xl mb-16">
        📝 {currentUser?.first_name}&#39;s Files
      </h1>

      {userFiles.length > 0 && (
        <p className="text-xl lg:text-2xl mb-16">
          Click on the file link to download it locally to your device. 👩🏽‍💻
        </p>
      )}

      {userFiles.length > 0 ? (
        <ul className="space-y-7">
          {userFiles.map((userFile) => {
            return (
              <li className="border-2 p-5" key={userFile._id}>
                File Name:{' '}
                <button
                  type="button"
                  className="underline hover:text-blue-600 disabled:opacity-50 disabled:no-underline"
                  disabled={downloadingFileID === userFile._id}
                  onClick={() => handleFileDownload(userFile._id)}
                >
                  {downloadingFileID === userFile._id
                    ? 'Downloading...'
                    : userFile.file_name}
                </button>{' '}
                &nbsp; | &nbsp; File Type: {userFile.file_type} &nbsp; | &nbsp;
                Date Uploaded:{' '}
                {dayjs(userFile.date_uploaded).format('dddd, MMMM D, YYYY')}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-2xl">You have files available for download. 😔</p>
      )}
    </div>
  );
};
