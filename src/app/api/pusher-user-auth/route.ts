import { NextRequest, NextResponse } from 'next/server';
import { appRouter } from '../../../server';
import { queryStringToJson } from '../../../utils/query-string-to-json';

async function handler(_req: NextRequest) {
  const body = await _req.text();
  const parsedBody = queryStringToJson(body);
  const socketId = parsedBody?.socket_id;
  const userId = parsedBody?.userId;
  const channelName = parsedBody?.channel_name;
  const watchlist = parsedBody?.watchlist;

  if (!socketId || !userId) {
    return NextResponse.json({ error: 'Invalid socketId or userId' }, { status: 400 });
  }
  const caller = appRouter.createCaller({} as any);
  const data = await caller.chat.signIn({
    socketId,
    userId,
    channelName,
    watchlist,
  });

  return NextResponse.json(data);
}

export { handler as POST };
