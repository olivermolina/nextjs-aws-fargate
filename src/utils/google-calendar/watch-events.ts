import { google } from 'googleapis';
import { setOauthClientCredentials } from './set-oauth-client-credentials';
import prisma from '../../libs/prisma';
import { getBaseUrl } from '../get-base-url';
import { v4 as uuid } from 'uuid';

export async function watchEvents(
  staffId: string,
  googleCalendarSettingId: string,
  resourceId?: string | null,
  channelId?: string | null,
) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    getBaseUrl(),
  );
  await setOauthClientCredentials(oauth2Client, staffId);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const people = await google.people({ version: 'v1', auth: oauth2Client });
  const me = await people.people.get({
    resourceName: 'people/me',
    personFields: 'emailAddresses',
  });

  console.log('watchEvent', { staffId, googleCalendarSettingId });
  try {
    if (resourceId && channelId) {
      try {
        await calendar.channels.stop({
          requestBody: {
            id: channelId,
            resourceId,
          },
        });

        console.log('Channel stopped successfully', { googleCalendarSettingId });
      } catch (e) {
        console.log('Error stopping channel', e);
      }
    }

    const newChannelId = uuid();
    const response = await calendar.events.watch({
      calendarId: 'primary',
      requestBody: {
        id: newChannelId,
        type: 'web_hook',
        address: 'https://admin.lunahealth.app/api/google-calendar-webhook',
        token: googleCalendarSettingId,
      },
    });

    try {
      await prisma.googleCalendarSetting.update({
        where: {
          id: googleCalendarSettingId,
        },
        data: {
          watch_resource_id: response.data.resourceId,
          watch_expiration: response.data.expiration,
          watch_channel_id: newChannelId,
        },
      });
    } catch (e) {
      console.error(e);
    }

    console.log('Channel event watch successfully', {
      me: me.data?.emailAddresses?.[0]?.value,
      googleCalendarSettingId,
      staffId,
    });

    return response.data;
  } catch (e) {
    console.error(e);
  }
}
