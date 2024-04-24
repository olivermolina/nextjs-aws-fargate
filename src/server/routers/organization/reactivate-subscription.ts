import { isAuthenticated } from '../middleware/isAuthenticated';
import prisma from 'src/libs/prisma';
import { reactivateSubscription } from 'src/utils/stripe/reactivate-subscription';
import { AppAccess } from '@prisma/client';
import { TRPCError } from '@trpc/server';

export const reactivate = isAuthenticated
  .mutation(async ({ input, ctx }) => {

    const organization = await prisma.organization.findUniqueOrThrow({
      where: {
        id: ctx.user.organization_id,
      },
    });

    if (!organization.stripe_subscription_id) {
      throw new Error('No subscription found');
    }

    const stripeSubscription = await reactivateSubscription(organization.stripe_subscription_id);
    if (stripeSubscription.status != 'active') {
      throw new TRPCError({
        code: 'CONFLICT',
        message: `'Sorry, we couldn't reactivate your subscription. Please contact support.'`,
      });
    }

    return await prisma.organization.update({
      where: {
        id: ctx.user.organization.id,
      },
      data: {
        access: AppAccess.Allow,
      },
    });
  });
