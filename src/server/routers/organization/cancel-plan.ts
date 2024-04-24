import { isAuthenticated } from '../middleware/isAuthenticated';
import loadStripeClient from 'src/libs/stripe';
import { TRPCError } from '@trpc/server';
import prisma from 'src/libs/prisma';
import { AppAccess } from '@prisma/client';

export const cancelPlan = isAuthenticated
  .mutation(async ({ input, ctx }) => {
    const stripe = loadStripeClient();

    const subscriptId = ctx.user.organization.stripe_subscription_id;

    if (!subscriptId) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Invalid subscription.',
      });
    }

    try{
     await stripe.subscriptions.cancel(subscriptId);

      return await prisma.organization.update({
        where: {
          id: ctx.user.organization.id,
        },
        data: {
          additional_users: 1,
          stripe_subscription_id: null,
          access: AppAccess.Block,
        },
      });
    } catch (e) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Unable to cancel subscription. Please contact support.',
      });
    }
  });
