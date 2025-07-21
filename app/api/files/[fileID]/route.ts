import { NextResponse, NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { FileModel, getObjectIDFromString } from '@/utils/mongodb';

type Params = Promise<{ fileID: string }>;

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
): Promise<Response> {
  const user = await currentUser();

  if (!user)
    return NextResponse.json(
      { message: "You're not authorized to make this request." },
      { status: 401 }
    );

  try {
    const { fileID } = await params;

    const targetID = getObjectIDFromString(fileID);

    const deleteFile = await FileModel.findOneAndDelete({ _id: targetID });

    if (deleteFile) {
      return NextResponse.json(
        { status: 200, message: 'Your message was successfully deleted.' },
        { status: 200 }
      );
    }

    throw new Error(
      `Could not delete file with fileID ${fileID} from database.`
    );
  } catch (error) {
    const { fileID } = await params;
    // TODO: Handle in telemetry.
    console.log(`Error in DELETE /api/files/${fileID} `, error);

    return NextResponse.json(
      {
        status: 500,
        message: `There was a problem deleting the file ${fileID}. Try again later.`
      },
      { status: 500 }
    );
  }
}
