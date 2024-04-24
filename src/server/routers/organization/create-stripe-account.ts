import { isAuthenticated } from '../middleware/isAuthenticated';

import loadStripeClient from 'src/libs/stripe';
import { TRPCError } from '@trpc/server';
import { getBaseUrl } from '../../../utils/get-base-url';
import { paths } from '../../../paths';
import prisma from '../../../libs/prisma';
import Stripe from 'stripe';

const createStripeAccount = isAuthenticated.mutation(async ({ input, ctx }) => {
  const stripe = loadStripeClient();

  const existingStripeConnect = await prisma.stripeConnect.findFirst({
    where: {
      organization_id: ctx.user.organization.id,
    },
  });

  let account: Stripe.Account | undefined;

  if (existingStripeConnect) {
    account = await stripe.accounts.retrieve(existingStripeConnect.stripe_user_id);
  } else {
    const email = ctx.user.organization.bill_email || ctx.user.organization.email || ctx.user.email || '';
    const country = ctx.user.organization.billing_address?.country || undefined;
    account = await stripe.accounts.create({
      type: 'standard',
      email,
      country: country,
      business_type: 'individual',
      individual: {
        email,
        first_name: ctx.user.first_name || undefined,
        last_name: ctx.user.last_name || undefined,
        phone: ctx.user.organization.phone || ctx.user.phone || undefined,
        address: {
          city: ctx.user.organization.billing_address?.city || undefined,
          line1: ctx.user.organization.billing_address?.address_line1 || undefined,
          line2: ctx.user.organization.billing_address?.address_line2 || undefined,
          postal_code: ctx.user.organization.billing_address?.postal_code || undefined,
          state: ctx.user.organization.billing_address?.state || undefined,
          country: country,
        },
      },
    });
  }

  if (!account) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unable to create Stripe account. Please try again.',
    });
  }

  await prisma.stripeConnect.upsert({
    where: {
      organization_id: ctx.user.organization.id,
    },
    create: {
      organization_id: ctx.user.organization.id,
      stripe_user_id: account.id,
    },
    update: {
      stripe_user_id: account.id,
    },
  });

  try {
    return await stripe.accountLinks.create({
      account: account.id,
      refresh_url: getBaseUrl() + paths.dashboard.account + '?tab=organization',
      return_url: getBaseUrl() + '/stripe-authenticate',
      type: 'account_onboarding',
    });

  } catch (e) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: e.message,
    });
  }
});

export default createStripeAccount;
