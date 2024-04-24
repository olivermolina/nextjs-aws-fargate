import { t } from 'src/server/trpc';
import { disconnectGoogleCalendar } from './disconnect-google-calendar';
import { getGoogleCalendarSetting } from './get-google-calendar-setting';
import { authorizeGoogle } from './authorize-google';
import { updateGoogleCalendarSetting } from './update-google-calendar-setting';
import { calendarSync } from './calendar-sync';
import { calendarWatchRefresh } from './calendar-watch-refresh';
import { googlePushNotification } from './google-push-notification';
import { saveSrFaxSettings } from './srfax/save-srfax-settings';
import { getSrFaxSettings } from './srfax/get-srfax-settings';

const extensionRouter = t.router({
  authorizeGoogle,
  getGoogleCalendarSetting,
  disconnectGoogleCalendar,
  updateGoogleCalendarSetting,
  calendarSync,
  calendarWatchRefresh,
  googlePushNotification,
  saveSrFaxSettings,
  getSrFaxSettings,
});

export default extensionRouter;
