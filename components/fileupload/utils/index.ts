import { LeanFile } from '@/utils/mongodb';
import {
  createNoteFileDocs,
  createPresignedUrl,
  handleFileDocUpdate,
  handleNoteDeletion,
} from '@/actions/fileupload';

export { createNoteFileDocs, createPresignedUrl, handleFileDocUpdate, handleNoteDeletion };

export const filterCurrentFiles = <T extends File>(
  currentFiles: T[],
  fileDBResults: LeanFile[]
) => {
  const createdFiles = fileDBResults.map((leanFile) => leanFile.file_name);

  const filteredFiles = currentFiles.filter((file) =>
    createdFiles.includes(file.name)
  );

  return filteredFiles;
};
