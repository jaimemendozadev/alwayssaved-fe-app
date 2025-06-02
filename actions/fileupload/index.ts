'use server';
import {
  dbConnect,
  LeanFile,
  LeanNote,
  NoteModel,
  FileModel,
  deepLean,
  getObjectIDFromString
} from '@/utils/mongodb';

import { handlePresignedUrlsWithClient } from '@/utils/aws';

import { s3UploadResult } from '@/components/fileupload/utils';

/*************************************************
 * handleNoteDeletion
 **************************************************/

export const handleFileDeletion = async (
  fileDBIDs: string[]
): Promise<void> => {
  try {
    await dbConnect();

    const deletionResults = await Promise.allSettled(
      fileDBIDs.map(async (fileStringID) => {
        try {
          const _id = getObjectIDFromString(fileStringID);

          return FileModel.findOneAndDelete({ _id }).exec();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);

          throw new Error(`Error in handleFileDeletion: ${message}`);
        }
      })
    );

    // Log File Deletion Failures
    deletionResults.forEach((result) => {
      if (result.status === 'rejected') {
        // TODO: Handle in telemetry.
        console.error('Deletion failed:', result.reason);
      }
    });
  } catch (error) {
    // TODO: Handle in telemetry.
    console.log('Error in handleFileDeletion: ', error);
  }
};

/***************************************************/

/*************************************************
 * handleNoteDeletion
 **************************************************/

export const handleNoteDeletion = async (newNote: LeanNote): Promise<void> => {
  try {
    await dbConnect();

    const _id = getObjectIDFromString(newNote._id);

    await NoteModel.findOneAndDelete({ _id }).exec();
  } catch (error) {
    // TODO: Handle in telemetry.
    console.log(
      `Error in handleNoteDeletion for Note with ID of ${newNote._id}:`,
      error
    );
  }
};

/***************************************************/

/*************************************************
 * handleFileDocUpdate
 **************************************************/

interface UpdateStatus {
  file_id: string;
  update_status: string;
}

export const handleFileDocUpdate = async (
  fileUpdates: s3UploadResult[]
): Promise<UpdateStatus[]> => {
  const updateResults = await Promise.allSettled(
    fileUpdates.map(async (updateInfo) => {
      const { file_id, update } = updateInfo;

      try {
        const targetID = getObjectIDFromString(file_id);

        const updatedFile = await FileModel.findByIdAndUpdate(
          targetID,
          update,
          {
            new: true
          }
        ).exec();

        console.log('updatedFile ', updatedFile);

        return {
          file_id,
          update_status: 'success'
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        throw new Error(
          `Error in handleFileDocUpdate for file_id ${file_id}: ${message}`
        );
      }
    })
  );

  // Log File Deletion Failures
  updateResults.forEach((result) => {
    if (result.status === 'rejected') {
      // TODO: Handle in telemetry.
      console.error('File document update failed:', result.reason);
    }
  });

  const filteredResults = updateResults.filter(
    (result) => result.status === 'fulfilled'
  );

  const finalizedResults = filteredResults.map((result) => result.value);

  return finalizedResults;
};

/***************************************************/

/*************************************************
 * createNoteFileDocs
 **************************************************/

export interface noteFileResult {
  newNote: LeanNote[];
  fileDBResults: LeanFile[];
}

export interface fileInfo {
  name: string;
  type: string;
}

interface createNoteFileDocsArguments {
  fileInfoArray: fileInfo[];
  currentUserID: string;
  noteTitle: string;
}

export const createNoteFileDocs = async ({
  fileInfoArray,
  currentUserID,
  noteTitle
}: createNoteFileDocsArguments): Promise<noteFileResult> => {
  try {
    await dbConnect();

    // 1) Create a single MongoDB Note document.
    const userMongoID = getObjectIDFromString(currentUserID);

    const notePayload = {
      user_id: userMongoID,
      title: noteTitle
    };

    const [createdNote] = await NoteModel.create([notePayload], { j: true });

    if (!createdNote) {
      throw new Error(
        `There was a problem creating a Note document for user ${currentUserID} in createNoteFileDocs.`
      );
    }

    const noteMongoID = createdNote._id;

    // 2) Create File documents for each fileInfo object.
    const fileDBResults = await Promise.allSettled(
      fileInfoArray.map(async (file) => {
        const file_name = file.name;
        const file_type = file.type;

        try {
          const filePayload = {
            user_id: userMongoID,
            note_id: noteMongoID,
            file_name,
            file_type
          };

          const [createdFile] = await FileModel.create([filePayload], {
            j: true
          });

          return createdFile;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);

          throw new Error(
            `Error in createNoteFileDocs for user_id ${currentUserID}, note_id ${createdNote._id}, for file_name ${file_name}: ${message}`
          );
        }
      })
    );

    console.log('fileDBResults ', fileDBResults);

    const newNote = [deepLean(createdNote)];

    // Log File document creation failures
    fileDBResults.forEach((result) => {
      if (result.status === 'rejected') {
        // TODO: Handle in telemetry.
        console.error('File document creation failed:', result.reason);
      }
    });

    // 3) Filter out and sanitize fulfilled results.
    const filteredResults = fileDBResults.filter(
      (result) => result.status === 'fulfilled'
    );

    const finalizedResults = filteredResults.map((result) =>
      deepLean(result.value)
    );

    return {
      newNote,
      fileDBResults: finalizedResults
    };
  } catch (error) {
    //TODO: Handle in telemetry.
    console.log('Error in createNoteFileDocs ', error);
  }

  return {
    newNote: [],
    fileDBResults: []
  };
};

/***************************************************/

/*************************************************
 * handlePresignedUrls
 **************************************************/

export interface s3FilePayload {
  s3_key: string;
  file_id: string;
  file_name: string;
  presigned_url: string;
}

// See Note #1 below.
export const handlePresignedUrls = async (
  fileDocuments: LeanFile[]
): Promise<s3FilePayload[]> => {
  const presignResults = await Promise.allSettled(
    fileDocuments.map(async (fileDoc) => {
      const { file_name, note_id, user_id, _id } = fileDoc;

      const s3_key = `${user_id}/${note_id}/${_id}/${file_name}`;

      console.log('s3_key is ', s3_key);

      try {
        const presignedURL = await handlePresignedUrlsWithClient(s3_key);

        console.log('presignedUrl ', presignedURL);

        return {
          s3_key,
          file_id: _id,
          file_name,
          presigned_url: presignedURL
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        throw new Error(
          `Error in handlePresignedUrls for s3_key: ${s3_key}: ${message}`
        );
      }
    })
  );

  console.log('presignResults ', presignResults);

  // Log preSignUrl Failures
  presignResults.forEach((result) => {
    if (result.status === 'rejected') {
      // TODO: Handle in telemetry.
      console.error('Creating PresignUrl failed: ', result.reason);
    }
  });

  const filteredResults = presignResults.filter(
    (result) => result.status === 'fulfilled'
  );

  const finalizedResults = filteredResults.map((result) => result.value);

  return finalizedResults;
};

/******************************************************/
