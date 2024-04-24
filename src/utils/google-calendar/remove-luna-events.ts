import { google } from 'googleapis';
import { setOauthClientCredentials } from './set-oauth-client-credentials';
import { getBaseUrl } from '../get-base-url';
import { listEvents } from './pull-google-calendar-events';


export const removeLunaEvents = async (staffId: string) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    getBaseUrl(),
  );
  await setOauthClientCredentials(oauth2Client, staffId);

  const events = await listEvents(oauth2Client, undefined, staffId);
  console.log('events', events.length);

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  await Promise.all(events.map(async (event) => {
    if (!event.id) {
      return;
    }

    console.log('Deleting event', event.id);
    return await calendar.events.delete({
      calendarId: 'primary',
      eventId: event.id,
    });
  }));

  console.info('Successfully removed Luna events from Google Calendar');
};
