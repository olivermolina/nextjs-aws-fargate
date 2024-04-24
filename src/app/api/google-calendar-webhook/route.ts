import { NextRequest, NextResponse } from 'next/server';
import { appRouter } from '../../../server';

async function handler(req: NextRequest) {
  const textBody = await req.text();
  console.log({ textBody });

  try {
    const jsonBody = await req.json();
    console.log({ jsonBody });
  } catch (e) {
    console.error('Failed to parse json body');
  }

  // Extract values from the headers
  const channelId = req.headers.get('X-Goog-Channel-ID');
  const channelToken = req.headers.get('X-Goog-Channel-Token');
  const resourceId = req.headers.get('X-Goog-Resource-ID');
  const resourceUri = req.headers.get('X-Goog-Resource-URI');
  const resourceState = req.headers.get('X-Goog-Resource-State');
  if (channelToken && channelId) {
    console.log({ resourceId, resourceUri, channelId, channelToken, resourceState });
    const caller = appRouter.createCaller({} as any);
    await caller.extension.googlePushNotification({
      channelToken,
      channelId,
    });
  }

  // Respond with a 200 status to acknowledge receipt of the notification
  return NextResponse.json({ message: 'Notification received' });
}

export { handler as POST };
