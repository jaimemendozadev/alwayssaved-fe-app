import { presignPayload } from '@/actions/fileuploadcontext';
import { LeanFile } from '@/utils/mongodb';

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
