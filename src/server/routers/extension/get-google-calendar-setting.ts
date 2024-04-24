import { isAuthenticated } from '../middleware/isAuthenticated';
import prisma from '../../../libs/prisma';

export const getGoogleCalendarSetting = isAuthenticated.query(async ({ ctx }) => {
  const user = await prisma.user.findUnique({
    where: {
      id: ctx.user.id,
    },
    include: {
      google_calendar_setting: true,
    },
  });

  return user?.google_calendar_setting;
});
