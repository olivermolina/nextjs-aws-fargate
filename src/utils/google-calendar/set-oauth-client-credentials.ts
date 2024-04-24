import prisma from 'src/libs/prisma';
import dayjs from 'dayjs';
import { Auth } from 'googleapis';

export const setOauthClientCredentials = async (
  oauth2Client: Auth.OAuth2Client,
  staffId: string,
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: staffId,
    },
    include: {
      google_calendar_setting: true,
    },
  });

  if (!user?.google_calendar_setting) {
    throw new Error('Google calendar setting not found!');
  }

  const { access_token, refresh_token, expiry_date, token_type, id_token } =
    user.google_calendar_setting;

  oauth2Client.setCredentials({
    access_token,
    refresh_token,
    expiry_date,
    token_type,
    id_token,
    scope: 'https://www.googleapis.com/auth/calendar',
  });

  // Check if the access token is expired
  if (dayjs().isAfter(dayjs(expiry_date))) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();

      const newSetting = await prisma.googleCalendarSetting.update({
        where: {
          id: user.google_calendar_setting.id,
        },
        data: {
          access_token: credentials.access_token,
          refresh_token: credentials.refresh_token,
          expiry_date: credentials.expiry_date,
        },
      });

      oauth2Client.setCredentials(credentials);

      return newSetting;
    } catch (e) {
      console.log('Error refreshing access token', e);
    }
  }

  return user.google_calendar_setting;
};
