import {
  handleFileDocUpdate,
  handleNoteDeletion,
  handleFileDeletion,
} from '@/actions/fileuploadcontext';

import { LeanFile, LeanNote } from '@/utils/mongodb';
import { presignPayload } from '@/actions/fileuploadcontext/handlePresignedUrls';


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



/*************************************************
 * verifyProcessUploadResults
 **************************************************/


/******************************************************/

/********************************************
 * Notes
 ********************************************

 1) Media assets are stored in s3 in the following s3 Key format: 

    /{fileOwner}/{noteID}/{fileID}/{fileName}.{fileExtension} 

    fileOwner: is the User._id
    fileName: is the name of the file with the fileType extension 

*/

