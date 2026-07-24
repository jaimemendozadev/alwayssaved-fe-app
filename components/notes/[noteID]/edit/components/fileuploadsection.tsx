'use client';
import { ReactNode } from 'react';
import { LeanUser } from '@/utils/mongodb';
import { FileUpload } from '@/components/fileupload';
import { UploadInstructions } from '@/components/uploadinstructions';

interface FileUploadSectionProps {
  currentUser: LeanUser;
  currentNoteID: string;
  handleRedirect: () => void;
}

export const FileUploadSection = ({
  currentNoteID,
  currentUser,
  handleRedirect
}: FileUploadSectionProps): ReactNode => {
  return (
    <>
      <h2 className="text-3xl lg:text-4xl mb-10">
        Upload More Files to Your Note
      </h2>

      <UploadInstructions />

      <div className="mb-44">
        <FileUpload
          currentUser={currentUser}
          currentNoteID={currentNoteID}
          routerCallback={handleRedirect}
        />
      </div>
    </>
  );
};
