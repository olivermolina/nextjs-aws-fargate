import prisma from '../../../libs/prisma';
import { publicProcedure } from '../../trpc';
import { watchEvents } from '../../../utils/google-calendar/watch-events';

export const calendarWatchRefresh = publicProcedure.mutation(async ({ input }) => {
  const users = await prisma.user.findMany({
    where: {
      NOT: {
        google_calendar_setting_id: null,
      },
    },
    include: {
      google_calendar_setting: true,
    },
  });

  console.info('Calendar watch refresh', { count: users.length });

  await Promise.all(
    users
      .filter((user) => user.google_calendar_setting)
      .map(async (user) =>
        user.google_calendar_setting
          ? await watchEvents(
            user.id,
            user.google_calendar_setting.id,
            user.google_calendar_setting.watch_resource_id,
            user.google_calendar_setting.watch_channel_id,
          )
          : null,
      ),
  );

  return 'Success!';
});
