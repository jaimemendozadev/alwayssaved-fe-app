import {
  handleFileDeletion,
  handleNoteDeletion,
  handlePresignedUrls,
  createNoteDocument,
  createFileDocuments,
} from '@/actions/fileuploadcontext';
import { LeanFile } from '@/utils/mongodb';
import { presignPayload } from '@/actions/fileuploadcontext/handlePresignedUrls';
import { handleS3FileUploads } from './handleS3FileUploads';
import { verifyProcessUploadResults } from './verifyProcessUploadResults';


export {
    handleS3FileUploads,
    verifyProcessUploadResults,
    handleFileDeletion,
    handleNoteDeletion,
    handlePresignedUrls,
    createNoteDocument,
    createFileDocuments
}

/*************************************************
 * filterCurrentFiles
 **************************************************/

export const filterCurrentFiles = <T extends File>(
  currentFiles: T[],
  targetFiles: LeanFile[] | presignPayload[]
): T[] => {
  const arrayOfFileNames = targetFiles.map((leanFile) => leanFile.file_name);

  const filteredFiles = currentFiles.filter((file) =>
    arrayOfFileNames.includes(file.name)
  );

  return filteredFiles;
};

/******************************************************/


