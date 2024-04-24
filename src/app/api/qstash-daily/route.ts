import { NextRequest, NextResponse } from 'next/server';
import { verifySignatureAppRouter } from '@upstash/qstash/dist/nextjs';
import { appRouter } from 'src/server';

async function handler(_req: NextRequest) {
  let jobId,
    scheduleId,
    consultationId = '';

  try {
    const textBody = await _req.text();
    if (!textBody) {
      const jsonBody = await _req.json();
      jobId = jsonBody?.jobId;
      consultationId = jsonBody?.consultationId;
      scheduleId = jsonBody?.scheduleId;
    } else {
      const parsedBody = JSON.parse(textBody);
      jobId = parsedBody?.jobId;
      consultationId = parsedBody?.consultationId;
      scheduleId = parsedBody?.scheduleId;
    }
  } catch (e) {
    console.error(e);
  }

  scheduleId = scheduleId || _req.headers.get('Upstash-Schedule-Id') || '';

  const caller = appRouter.createCaller({} as any);

  // Check if the job is finished and get the transcript and SOAP notes
  await caller.consultation.dailyProcessedJob({
    scheduleId,
    jobId,
    consultationId,
  });
  return NextResponse.json('Success!');
}

export const POST =
  process.env.NODE_ENV === 'development' ? handler : verifySignatureAppRouter(handler);
