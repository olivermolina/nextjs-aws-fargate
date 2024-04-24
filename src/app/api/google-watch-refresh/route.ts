import { NextRequest, NextResponse } from 'next/server';
import { appRouter } from '../../../server';

async function handler(_req: NextRequest) {
  const caller = appRouter.createCaller({} as any);

  await caller.extension.calendarWatchRefresh();

  return NextResponse.json({ message: 'Success!' });
}

export { handler as POST };
