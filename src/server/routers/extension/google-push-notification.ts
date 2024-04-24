import { publicProcedure } from '../../trpc';
import z from 'zod';
import prisma from '../../../libs/prisma';
import { TRPCError } from '@trpc/server';
import {
  pullGoogleCalendarEvents,
} from '../../../utils/google-calendar/pull-google-calendar-events';

export const googlePushNotification = publicProcedure
  .input(
    z.object({
      channelToken: z.string(),
      channelId: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    const settings = await prisma.googleCalendarSetting.findUnique({
      where: {
        id: input.channelToken,
        watch_channel_id: input.channelId,
      },
      include: {
        User: true,
      },
    });

    if (!settings) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Google Calendar Setting not found',
      });
    }

    const staff = settings?.User?.[0];

    if (!staff) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Staff not found for this Google Calendar Setting',
      });
    }
    // Pull events from the staff primary calendar
    if (settings.pull_calendar) {
      // Sync events
      pullGoogleCalendarEvents(staff.id);
    }

    return 'Success!';
  });
