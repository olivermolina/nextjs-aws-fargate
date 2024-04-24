import { isAuthenticated } from '../middleware/isAuthenticated';
import prisma from '../../../libs/prisma';
import { UserType } from '@prisma/client';

export const gettingStarted = isAuthenticated.query(async ({ ctx }) => {
  const [patientCount, serviceCount, googleCalendarCount, stripeConnectCount] =
    await prisma.$transaction([
      prisma.user.count({
        where: {
          organization_id: ctx.user.organization_id,
          type: UserType.PATIENT,
        },
      }),
      prisma.service.count({
        where: {
          organization_id: ctx.user.organization_id,
        },
      }),
      prisma.googleCalendarSetting.count({
        where: {
          User: {
            some: {
              organization_id: ctx.user.organization_id,
            },
          },
        },
      }),
      prisma.stripeConnect.count({
        where: {
          organization_id: ctx.user.organization_id,
        },
      }),
    ]);

  return {
    hasPatients: patientCount > 0,
    hasServices: serviceCount > 0,
    hasGoogleCalendar: googleCalendarCount > 0,
    hasStripe: stripeConnectCount > 0,
  };
});
