import { isAuthenticated } from '../middleware/isAuthenticated';
import prisma from 'src/libs/prisma';

export const getPaymentMethod = isAuthenticated.query(async ({ input, ctx }) => {
  return prisma.stripeOrganizationPaymentMethod.findFirstOrThrow({
    where: {
      organization_id: ctx.user.organization.id,
    },
    include: {
      stripe_payment_method: true,
    },
  });
});
