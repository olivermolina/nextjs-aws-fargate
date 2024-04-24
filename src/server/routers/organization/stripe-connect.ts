import { isAuthenticated } from '../middleware/isAuthenticated';
import loadStripeClient from 'src/libs/stripe';
import z from 'zod';
import { TRPCError } from '@trpc/server';
import prisma from 'src/libs/prisma';

export const stripeConnect = isAuthenticated
  .input(z.object({
    code: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    const stripe = loadStripeClient();

    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code: input.code,
    });

    if (!response?.stripe_user_id || !response?.access_token) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'Unable to connect to Stripe.',
      });
    }

    const data = {
      stripe_user_id: response.stripe_user_id || '',
      stripe_publishable_key: response.stripe_publishable_key || '',
      refresh_token: response.refresh_token || '',
      access_token: response.access_token,
      livemode: response.livemode || false,
    };

    return prisma.stripeConnect.upsert({
      where: {
        id: ctx.user.organization.id,
      },
      create: {
        ...data,
        organization_id: ctx.user.organization.id,
      },
      update: data,
    });
  });
