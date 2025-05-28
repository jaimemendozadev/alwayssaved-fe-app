import { LeanFile } from '@/utils/mongodb';
import {
  createNoteFileDocs,
  createPresignedUrl,
  handleFileDocUpdate,
  handleNoteDeletion,
  handleFileDeletion,
  noteFileResult
} from '@/actions/fileupload';

export {
  createNoteFileDocs,
  createPresignedUrl,
  handleFileDocUpdate,
};

const filterCurrentFiles = <T extends File>(
  currentFiles: T[],
  fileDBResults: LeanFile[]
) => {
  const createdFiles = fileDBResults.map((leanFile) => leanFile.file_name);

  const filteredFiles = currentFiles.filter((file) =>
    createdFiles.includes(file.name)
  );

  return filteredFiles;
};

interface validationCheck<T extends File> {
  message: string;
  continue: boolean;
  noteFileResult: noteFileResult;
  currentFiles: T[];
}

export const checkNoteFileResultAndUserFiles = async <T extends File>(
  noteFileResult: noteFileResult,
  currentFiles: T[]
): Promise<validationCheck<T>> => {
  let temp = [...currentFiles];

  const { newNote, fileDBResults } = noteFileResult;

  const validationCheck: validationCheck<T> = {
    message: '',
    continue: false,
    noteFileResult: {newNote: [], fileDBResults: []},
    currentFiles: []

  };

  // 1) There was a problem creating a Note, delete all created File documents.
  if (newNote.length === 0) {
    validationCheck['message'] =
      'There was a problem creating a Note for your files in the database. Try again later.';

    if (fileDBResults.length > 0) {
      await handleFileDeletion(fileDBResults);
    }

    return validationCheck;
  }

  // 2) There was a problem creating File documents for all the uploaded files, delete the parent Note document.
  if (fileDBResults.length === 0) {
    if (newNote.length > 0) {
      const [plucked] = newNote;
      await handleNoteDeletion(plucked);
    }

    validationCheck['message'] =
      'There was a problem saving your files in the database. Try uploading the files again later.';

    return validationCheck;
  }

  // 3) One of the uploaded files didn't get its File doucment created in the database, continue uploading files to s3.
  if (fileDBResults.length !== currentFiles.length) {
    temp = filterCurrentFiles(temp, fileDBResults);

    validationCheck['message'] =
      "Small Warning: It appears one of your files couldn't be saved. Try saving it again to the same note later.";
  }

  const validatedResult = {
    newNote,
    fileDBResults,
    currentFiles: temp
  };

  validationCheck['noteFileResult'] = validatedResult;

  validationCheck['continue'] = true;

  return validationCheck;
};
