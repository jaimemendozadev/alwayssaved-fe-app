import { NextResponse } from 'next/server';


export async function GET():Promise<Response> {
  const data = { message: "I'm ok. 👍🏽" };
  return NextResponse.json(data, { status: 200 });
}