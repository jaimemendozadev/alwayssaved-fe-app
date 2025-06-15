import { NextResponse, NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { deleteFileFromS3 } from '@/utils/aws';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { s3_key: string } }
): Promise<void | Response> {
  const user = await currentUser();

  if (!user)
    return NextResponse.json(
      { message: "You're not authorized to make this request." },
      { status: 401 }
    );

  try {
    const { s3_key } = params;

    const deleteRes = await deleteFileFromS3(s3_key);

    if (deleteRes.$metadata.httpStatusCode === 204) {
      return NextResponse.json({ status: 200 }, { status: 200 });
    }

    throw new Error(
      `Could not delete file with s3_key ${s3_key} from s3 bucket.`
    );
  } catch (error) {
    // TODO: Handle in telemetry
    console.log(`Error in DELETE /api/s3/${params.s3_key} `, error);

    return NextResponse.json(
      {
        status: 500,
        message: `There was a problem deleting the file with s3_key ${params.s3_key}. Try again later.`
      },
      { status: 500 }
    );
  }
}
