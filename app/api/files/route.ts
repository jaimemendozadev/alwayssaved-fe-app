import { NextResponse, NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { dbConnect, FileModel, getObjectIDFromString } from '@/utils/mongodb';

export async function PATCH(request: NextRequest): Promise<void | Response> {
  const user = await currentUser();

  if (!user)
    return NextResponse.json(
      { message: "You're not authorized to make this request." },
      { status: 401 }
    );

  const body = await request.json();

  const { file_id, s3_key } = body;

  try {
    await dbConnect();

    const targetID = getObjectIDFromString(file_id);

    const updatedFile = await FileModel.findByIdAndUpdate(
      targetID,
      {
        s3_key
      },
      {
        new: true
      }
    ).exec();

    console.log('updatedFile in PATCH /api/files', updatedFile);

    return NextResponse.json(
      {
        status: 200,
        message: `Your ${file_id} file has been updated! 🥳`
      },
      { status: 200 }
    );
  } catch (error) {
    // TODO: Handle in telemetry.
    console.log('Error in PATCH /api/files ', error);
    return NextResponse.json(
      {
        status: 500,
        message: `There was a problem updating the ${file_id} file. Try again later. 😬`
      },
      { status: 500 }
    );
  }
}
