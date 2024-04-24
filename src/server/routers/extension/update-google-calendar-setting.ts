import { isAuthenticated } from '../middleware/isAuthenticated';
import prisma from '../../../libs/prisma';
import z from 'zod';
import { pullGoogleCalendarEvents } from 'src/utils/google-calendar/pull-google-calendar-events';
import {
  pushEventsToGoogleCalendar,
} from 'src/utils/google-calendar/push-events-to-google-calendar';
import { watchEvents } from '../../../utils/google-calendar/watch-events';

export const updateGoogleCalendarSetting = isAuthenticated
  .input(
    z.object({
      id: z.string(),
      push_calendar: z.boolean().optional(),
      pull_calendar: z.boolean().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      const setting = await prisma.googleCalendarSetting.update({
        where: {
          id: input.id,
        },
        data: {
          ...(input.push_calendar && { push_calendar: input.push_calendar }),
          ...(input.pull_calendar && { pull_calendar: input.pull_calendar }),
        },
      });

      if (input.pull_calendar) {
        // Sync events
        pullGoogleCalendarEvents(ctx.user.id);
        watchEvents(ctx.user.id, setting.id, setting.watch_resource_id, setting.watch_channel_id);
      }

      if (input.push_calendar) {
        // Push events
        pushEventsToGoogleCalendar(ctx.user.id);
      }

      return setting;
    } catch (e) {
      console.log(e);
    }
  });
