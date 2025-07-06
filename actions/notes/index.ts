'use server';
import { deleteFileFromS3 } from '@/utils/aws';
import { FileModel, getObjectIDFromString } from '@/utils/mongodb';

export const purgeFileByID = async (fileID: string): Promise<void> => {
  const convertedID = getObjectIDFromString(fileID);

  const foundFile = await FileModel.findById(convertedID).exec();

  console.log('foundFile in purgeFileByID ', foundFile);

  if (foundFile) {
    const { s3_key } = foundFile;

    const s3Result = await deleteFileFromS3(s3_key);

    console.log('s3Result in purgeFileByID ', s3Result);
    console.log('\n');

    if (s3Result && s3Result.$metadata) {
      const statusCode = s3Result.$metadata.httpStatusCode;

      if (statusCode === 204) {
        await FileModel.findByIdAndDelete(convertedID).exec();
      }
    }
  }
};
