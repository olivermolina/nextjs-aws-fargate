import prisma from '../../../libs/prisma';
import { publicProcedure } from '../../trpc';
import {
  pullGoogleCalendarEvents,
} from '../../../utils/google-calendar/pull-google-calendar-events';
import {
  pushEventsToGoogleCalendar,
} from '../../../utils/google-calendar/push-events-to-google-calendar';
import z from 'zod';

export const calendarSync = publicProcedure
  .input(
    z.object({
      userId: z.string().optional(),
    }),
  )
  .mutation(async ({ input }) => {
    const users = await prisma.user.findMany({
      where: {
        NOT: {
          google_calendar_setting_id: null,
        },
        ...(input.userId && {
          id: input.userId,
        }),
      },
      include: {
        google_calendar_setting: true,
      },
    });

    console.info('Syncing google calendars', { count: users.length });

    for (let user of users) {
      if (user.google_calendar_setting?.pull_calendar) {
        pullGoogleCalendarEvents(user.id);
      }

      if (user.google_calendar_setting?.push_calendar) {
        pushEventsToGoogleCalendar(user.id);
      }
    }

    return 'Success!';
  });
