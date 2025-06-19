import {
  handleFileDeletion,
  handleNoteDeletion,
  handlePresignedUrls,
  createNoteDocument,
  createFileDocuments,
} from '@/actions/fileupload';
import { LeanFile } from '@/utils/mongodb';
import { presignPayload } from '@/actions/fileupload/handlePresignedUrls';
import { handleS3FileUploads } from './handleS3FileUploads';
import { processFile } from './processFile';
import { verifyProcessUploadResults } from './verifyProcessUploadResults';


export {
    handleS3FileUploads,
    verifyProcessUploadResults,
    handleFileDeletion,
    handleNoteDeletion,
    handlePresignedUrls,
    createNoteDocument,
    createFileDocuments,
    processFile
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


