import { isAuthenticated } from '../middleware/isAuthenticated';

import loadStripeClient from 'src/libs/stripe';
import prisma from '../../../libs/prisma';

export const invoices = isAuthenticated.query(async ({ input, ctx }) => {
  const stripe = loadStripeClient();
  const paymentMethod = await prisma.stripeOrganizationPaymentMethod.findFirstOrThrow({
    where: {
      organization_id: ctx.user.organization_id,
    },
  });
  const { data: invoices } = await stripe.invoices.list({
    customer: paymentMethod.stripe_customer_id,
  });

  return invoices;
});
