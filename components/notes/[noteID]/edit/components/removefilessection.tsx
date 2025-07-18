'use client';
import React, { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button, Tooltip, useDisclosure } from '@heroui/react';
import { purgeFileByID } from '@/actions/schemamodels/files';
import { DeleteModal } from '@/components/deletemodal';
import { LeanFile, LeanUser } from '@/utils/mongodb';

interface RemoveFilesSectionProps {
  currentUser: LeanUser;
  noteFiles: LeanFile[];
}

const toastOptions = { duration: 6000 };

export const RemoveFilesSection = ({
  currentUser,
  noteFiles
}: RemoveFilesSectionProps): ReactNode => {
  const [targetFile, setTargetFile] = useState<LeanFile | null>(null);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const router = useRouter();

  const deleteTextFile = async (onClose: () => void) => {
    if (targetFile === null) return;

    const { _id, file_type } = targetFile;

    const deletedFile = await purgeFileByID(_id, file_type);

    if (deletedFile && deletedFile.date_deleted) {
      toast.success(
        'Your text transcript File was successfully deleted. 👍🏽',
        toastOptions
      );
      onClose();
      router.refresh();
      return;
    }

    throw new Error(
      `There was an error deleting the .txt File ${_id} for User ${currentUser._id}.`
    );
  };

  if (noteFiles.length === 0) return null;

  return (
    <>
      <h2 className="text-3xl lg:text-4xl mb-10">
        Remove Files Attached to Your Note
      </h2>

      <article className="mb-24">
        <p className="text-lg mb-5 font-bold text-red-700">
          📢 WARNING ABOUT DELETING .txt FILES:
        </p>

        <p className="text-lg mb-3">
          If you delete a .txt text file from your Note, any Conversation that
          references that text File{' '}
          <strong>
            will severely affect the quality of your ongoing Conversation
          </strong>
          .
        </p>

        <p className="text-lg">
          In other words, the LLM will no longer understand what you&apos;re
          talking about going forward. 😵‍💫
        </p>
      </article>

      <DeleteModal
        deleteCallback={deleteTextFile}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        resourceType=".txt File"
      />

      {noteFiles.length > 0 && (
        <ul className="space-y-4 mb-16">
          {noteFiles.map((fileDoc) => (
            <li key={fileDoc._id} className="border p-5">
              <span className="font-semibold">File Name</span>:{' '}
              {fileDoc.file_name} &nbsp; | &nbsp;{' '}
              <span className="font-semibold">File Type</span>:{' '}
              {fileDoc.file_type} &nbsp; | &nbsp;{' '}
              <Tooltip content="Delete File">
                <Button
                  size="sm"
                  variant="ghost"
                  isIconOnly={true}
                  aria-label="Delete"
                  onPress={async () => {
                    if (fileDoc.file_type === '.txt') {
                      setTargetFile(fileDoc);
                      onOpen();
                      return;
                    }

                    const purgedResult = await purgeFileByID(
                      fileDoc._id,
                      fileDoc.file_type
                    );

                    if (purgedResult.date_deleted) {
                      toast.success(
                        'Your File has been deleted. 👍🏽',
                        toastOptions
                      );
                      router.refresh();
                    }
                  }}
                >
                  🗑️
                </Button>
              </Tooltip>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};
