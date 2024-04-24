import { TRPCError } from '@trpc/server';
import { isAuthenticated } from '../middleware/isAuthenticated';
import prisma from '../../../libs/prisma';
import { removeLunaEvents } from '../../../utils/google-calendar/remove-luna-events';

export const disconnectGoogleCalendar = isAuthenticated.mutation(async ({ ctx }) => {
  const user = await prisma.user.findUnique({
    where: {
      id: ctx.user.id,
    },
  });

  if (!user) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Unable to disconnect google calendar.',
    });
  }

  try {
    if (user.google_calendar_setting_id) {
      await removeLunaEvents(user.id);

      return prisma.$transaction([
        prisma.blockedSlot.deleteMany({
          where: {
            user_id: user.id,
          },
        }),
        prisma.consultation.updateMany({
          where: {
            staffs: {
              some: {
                staff_id: user.id,
              },
            },
          },
          data: {
            google_calendar_event_id: null,
          },
        }),

        prisma.googleCalendarSetting.delete({
          where: {
            id: user.google_calendar_setting_id,
          },
        }),
      ]);
    }
  } catch (e) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Unable to disconnect google calendar.',
    });
  }

  throw new TRPCError({
    code: 'NOT_FOUND',
    message: 'Unable to disconnect google calendar.',
  });
});
