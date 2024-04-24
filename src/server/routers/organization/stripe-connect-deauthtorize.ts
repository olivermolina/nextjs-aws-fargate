import { isAuthenticated } from '../middleware/isAuthenticated';
import loadStripeClient from 'src/libs/stripe';
import { TRPCError } from '@trpc/server';
import prisma from 'src/libs/prisma';

export const stripeConnectDeauthtorize = isAuthenticated
  .mutation(async ({ input, ctx }) => {
    const stripe = loadStripeClient();

    const stripeConnect = await prisma.stripeConnect.findUnique({
      where: {
        organization_id: ctx.user.organization_id,
      },
    });


    if (!stripeConnect) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Stripe connect is already deauthorized.',
      });
    }

    const response = await stripe.oauth.deauthorize({
      client_id: process.env.NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID || '',
      stripe_user_id: stripeConnect.stripe_user_id,
    });

    if (!response) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unable to deauthorize Stripe connect.',
      });
    }

    return prisma.stripeConnect.delete({
      where: {
        organization_id: ctx.user.organization.id,
      },
    });
  });
