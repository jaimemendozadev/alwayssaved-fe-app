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

/*************************************************
 * getFileExtension
 *
 * Utility function to extract the file extension from a path or URL.
 **************************************************/

export const getFileExtension = (filePath: string): string => {
  let pathToParse = filePath;

  try {
    const parsedUrl = new URL(filePath);
    pathToParse = parsedUrl.pathname; // safe extraction if it's a valid URL
  } catch (err) {
    // TODO: Handle in telemetry.
    console.log('Error in getFileExtension ', err);
  }

  const lastDotIndex = pathToParse.lastIndexOf('.');
  const lastSlashIndex = Math.max(
    pathToParse.lastIndexOf('/'),
    pathToParse.lastIndexOf('\\')
  );

  if (lastDotIndex > lastSlashIndex && lastDotIndex !== -1) {
    return pathToParse.slice(lastDotIndex);
  }

  return '';
};

/******************************************************/
