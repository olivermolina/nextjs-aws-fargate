import { NextRequest, NextResponse } from 'next/server';
import { appRouter } from '../../../server';

async function handler(_req: NextRequest) {
  let recordingId,
    type,
    consultationId = '';

  try {
    const textBody = await _req.text();
    if (!textBody) {
      const jsonBody = await _req.json();
      recordingId = jsonBody?.payload?.recording_id;
      type = jsonBody?.type;
      consultationId = jsonBody?.payload?.room_name;
    } else {
      const parsedBody = JSON.parse(textBody);
      recordingId = parsedBody?.payload?.recording_id;
      type = parsedBody?.type;
      consultationId = parsedBody?.payload?.room_name;
    }
  } catch (e) {
    console.error(e);
  }

  if (!recordingId || !consultationId || type !== 'recording.ready-to-download') {
    return NextResponse.json('Success!');
  }
  const caller = appRouter.createCaller({} as any);
  //Trigger batch processing transcription and SOAP notes
  await caller.consultation.dailyBatchProcessor({
    recordingId,
    consultationId,
  });

  return NextResponse.json('Success!');
}

export { handler as POST };
