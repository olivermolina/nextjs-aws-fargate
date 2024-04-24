import z from 'zod';
import prisma from 'src/libs/prisma';
import { createPaymentMethod } from 'src/utils/stripe/create-payment-method';
import { createStripeCustomer } from 'src/utils/stripe/create-customer';
import { getUserFullName } from 'src/utils/get-user-full-name';
import { TRPCError } from '@trpc/server';
import { publicProcedure } from '../../trpc';

const savePatientPaymentMethod = publicProcedure
  .input(z.object({
    id: z.string(),
    stripePaymentMethodId: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {

    const user = await prisma.user.findFirstOrThrow({
      where: {
        id: input.id,
      },
      include: {
        billing_address: true,
      },
    });

    const paymentMethod = await prisma.stripeUserPaymentMethod.findFirst({
      where: {
        user_id: user.id,
      },
      include: {
        stripe_payment_method: true,
      },
    });
    let stripeCustomerId: string | undefined;

    const stripeConnect = await prisma.stripeConnect.findFirst({
      where: {
        organization_id: user.organization_id,
      },
    });

    if (!stripeConnect) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'No Stripe connect account found for this organization.',
      });
    }

    if (!paymentMethod) {
      const stripeCustomer = await createStripeCustomer({
        email: user.email,
        name: user.bill_name || getUserFullName(user),
        address: {
          address_line1: user.billing_address?.address_line1 || '',
          address_line2: user.billing_address?.address_line1 || '',
          city: user.billing_address?.city || '',
          state: user.billing_address?.state || '',
          postal_code: user.billing_address?.postal_code || '',
          country: user.billing_address?.country || '',
        },
        entityId: user.id,
        entityType: 'user',
        stripeAccount: stripeConnect.stripe_user_id,
      });

      stripeCustomerId = stripeCustomer.id;
    } else {
      stripeCustomerId = paymentMethod.stripe_customer_id;
    }

    return await createPaymentMethod({
      entityType: 'user',
      entityId: user.id,
      stripeCustomerId: stripeCustomerId,
      stripePaymentMethodId: input.stripePaymentMethodId,
      stripeAccount: stripeConnect.stripe_user_id,
    });
  });

export default savePatientPaymentMethod;
