import { isAuthenticated } from '../middleware/isAuthenticated';
import prisma from 'src/libs/prisma';

export const getOrganization = isAuthenticated.query(async ({ input, ctx }) => {
  return prisma.organization.findFirst({
    where: {
      id: ctx.user.organization_id,
    },
    include: {
      address: true,
      billing_address: true,
      StripeConnect: {
        select: {
          stripe_user_id: true,
        },
      },
    },
  });
});
