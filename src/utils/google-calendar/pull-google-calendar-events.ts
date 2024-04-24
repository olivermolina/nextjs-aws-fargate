import { Auth, calendar_v3, google } from 'googleapis';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { setOauthClientCredentials } from './set-oauth-client-credentials';
import prisma from '../../libs/prisma';
import { getBaseUrl } from '../get-base-url';

dayjs.extend(utc);
dayjs.extend(timezone);

export async function listEvents(
  auth: Auth.OAuth2Client,
  nextPageToken?: string,
  staffId?: string | null,
): Promise<calendar_v3.Schema$Event[]> {
  const calendar = google.calendar({ version: 'v3', auth });
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(now.getDate() + 60); // Adding 60 days to the current date

  const res = await calendar.events.list({
    calendarId: 'primary', // Change 'primary' to the desired calendar ID.
    timeMin: now.toISOString(),
    timeMax: futureDate.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    showDeleted: true,
    fields: 'nextPageToken,items(id,summary,start,end,extendedProperties,status)',
    ...(staffId && { privateExtendedProperty: ['staffId=' + staffId] }),
    ...(nextPageToken && { pageToken: nextPageToken }),
  });

  const events = res.data.items || [];
  if (res.data.nextPageToken) {
    // If nextPageToken is present, make a recursive call to fetch the next page
    const nextPageEvents = await listEvents(auth, res.data.nextPageToken, staffId);
    return events.concat(nextPageEvents);
  }

  return events;
}

export const pullGoogleCalendarEvents = async (staffId: string) => {
  console.info('SyncGoogleCalendarEvents');
  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    getBaseUrl(),
  );
  await setOauthClientCredentials(oauth2Client, staffId);

  const events = await listEvents(oauth2Client);
  console.info('Syncing Google Calendar events', events.length);
  await prisma.$transaction(
    events
      .map((event) => {
        const { start, end, status } = event;
        const startTime = dayjs(start?.dateTime).toDate();
        const endTime = dayjs(end?.dateTime).toDate();

        if (status === 'cancelled') {
          return prisma.blockedSlot.deleteMany({
            where: {
              google_calendar_event_id: event.id || '',
            },
          });
        }

        return prisma.blockedSlot.upsert({
          where: {
            google_calendar_event_id: event.id || '',
          },
          create: {
            google_calendar_event_id: event.id || '',
            user_id: staffId,
            start_time: startTime,
            end_time: endTime,
            reason: 'BUSY',
          },
          update: {
            start_time: startTime,
            end_time: endTime,
            reason: 'BUSY',
          },
        });
      }),
  );

  console.info('Synced Google Calendar events');
};
