import { NextResponse } from 'next/server';


export function GET():Response {
  const data = { message: "I'm ok. 👍🏽" };
  return NextResponse.json(data, { status: 200 });
}