import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Auth, google } from 'googleapis';
import { ConsultationTrpcResponse } from '../../server/routers/consultation';
import { getUserFullName } from '../get-user-full-name';
import prisma from '../../libs/prisma';

dayjs.extend(utc);
dayjs.extend(timezone);

export async function updateEvent(
  auth: Auth.OAuth2Client,
  consultation: ConsultationTrpcResponse,
  timezone: string,
  staffId: string,
) {
  const calendar = google.calendar({ version: 'v3', auth });

  const startEventDate = dayjs(consultation.start_time).tz(timezone);
  const endEventDate = dayjs(consultation.end_time).tz(timezone);
  const staff = consultation.staffs?.[0]?.staff;

  try {
    const response = await calendar.events.update(
      {
        calendarId: 'primary',
        eventId: consultation.google_calendar_event_id!,
        requestBody: {
          summary: consultation.service?.name || consultation.title || consultation.description,
          start: {
            dateTime: startEventDate.toISOString(),
            timeZone: timezone,
          },
          end: {
            dateTime: endEventDate.toISOString(),
            timeZone: timezone,
          },
          description: consultation.description || consultation.title,
          attendees: [
            {
              displayName: getUserFullName(consultation.user),
              email: consultation.user.email,
            },
            {
              organizer: true,
              displayName: getUserFullName(staff),
              email: staff!.email,
            },
          ],
          organizer: {
            displayName: getUserFullName(staff),
            email: 'contact@lunahealth.app',
          },
          source: {
            title: 'Luna',
            url: 'https://lunahealth.app',
          },
          extendedProperties: {
            private: {
              staffId,
            },
          },
        },
      });

    await prisma.consultation.update({
      where: {
        id: consultation.id,
      },
      data: {
        google_calendar_event_id: response.data.id,
      },
    });
  } catch (e) {
    console.error(e);
  }


}
