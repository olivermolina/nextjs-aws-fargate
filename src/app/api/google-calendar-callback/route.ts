import { NextRequest, NextResponse } from 'next/server';

async function handler(_req: NextRequest) {
  const body = await _req.text();

  console.log({ body });

  return NextResponse.json('Success!');
}

export { handler as POST };
