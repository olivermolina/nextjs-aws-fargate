import { NextRequest, NextResponse } from 'next/server';
import { verifySignatureAppRouter } from '@upstash/qstash/dist/nextjs';
import { appRouter } from 'src/server';
import { AppointmentReminderType } from '@prisma/client';

async function handler(_req: NextRequest) {
  const body = await _req.json();
  const consultationId = body?.consultationId;
  const hoursBefore = body?.hoursBefore;
  const type = body?.type as AppointmentReminderType;

  const caller = appRouter.createCaller({} as any);

  const response = await caller.consultation.sendConsultationReminder({
    consultationId,
    hoursBefore,
    type,
  });

  return NextResponse.json({ data: response });
}

export const POST =
  process.env.NODE_ENV === 'development' ? handler : verifySignatureAppRouter(handler);
