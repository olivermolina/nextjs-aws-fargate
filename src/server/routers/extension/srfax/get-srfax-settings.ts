import { isAuthenticated } from '../../middleware/isAuthenticated';
import prisma from '../../../../libs/prisma';

export const getSrFaxSettings = isAuthenticated.query(async ({ ctx }) => {
  return prisma.sRFaxSettings.findUnique({
    where: {
      organization_id: ctx.user.organization_id,
    },
  });
});
