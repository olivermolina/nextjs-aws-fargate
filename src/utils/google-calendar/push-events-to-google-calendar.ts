import prisma from 'src/libs/prisma';
import { setOauthClientCredentials } from './set-oauth-client-credentials';
import { insertEvent } from './insert-event';
import { updateEvent } from './update-event';
import { ConsultationSelect, ConsultationTrpcResponse } from 'src/server/routers/consultation';
import dayjs from 'dayjs';
import { google } from 'googleapis';
import { getBaseUrl } from '../get-base-url';

export async function pushEventsToGoogleCalendar(staffId: string, consultationId?: string) {
  const oauth2Client = new google.auth.OAuth2(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, getBaseUrl());
  await setOauthClientCredentials(oauth2Client, staffId);

  const consultations = (await prisma.consultation.findMany({
    where: {
      staffs: {
        some: {
          staff_id: staffId,
        },
      },
      ...(consultationId && {
        id: consultationId,
      }),
    },
    select: ConsultationSelect,
  })) as ConsultationTrpcResponse[];
  const availability = await prisma.availability.findFirst({
    where: {
      user_id: staffId,
    },
  });
  const timezone = availability?.timezone || dayjs.tz.guess();

  const insertPromises = consultations.map((consultation) =>
    consultation?.google_calendar_event_id
      ? updateEvent(oauth2Client, consultation, timezone, staffId)
      : insertEvent(oauth2Client, consultation, timezone, staffId),
  );
  await Promise.all(insertPromises);
}
