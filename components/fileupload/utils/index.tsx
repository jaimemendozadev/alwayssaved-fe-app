import {
  handleFileDeletion,
  handlePresignedUrls,
  createNoteDocument,
  createFileDocuments
} from '@/actions/fileupload';
import { LeanFile } from '@/utils/mongodb';
import { presignPayload } from '@/actions/fileupload/handlePresignedUrls';
import { processFile } from './processFile';

export {
  handleFileDeletion,
  handlePresignedUrls,
  createNoteDocument,
  createFileDocuments,
  processFile
};

/*************************************************
 * filterCurrentFiles
 **************************************************/

export const filterCurrentFiles = <T extends File>(
  currentFiles: T[],
  targetFiles: LeanFile[] | presignPayload[]
): T[] => {
  const arrayOfFileNames = targetFiles.map(
    (targetFile) => targetFile.file_name
  );

  const filteredFiles = currentFiles.filter((file) =>
    arrayOfFileNames.includes(file.name)
  );

  return filteredFiles;
};

/******************************************************/
