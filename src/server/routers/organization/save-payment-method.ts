import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import prisma from 'src/libs/prisma';
import { createPaymentMethod } from 'src/utils/stripe/create-payment-method';
import { createStripeCustomer } from 'src/utils/stripe/create-customer';
import { getUserFullName } from 'src/utils/get-user-full-name';

export const savePaymentMethod = isAuthenticated
  .input(z.object({
    stripePaymentMethodId: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    const paymentMethod = await prisma.stripeOrganizationPaymentMethod.findFirst({
      where: {
        organization_id: ctx.user.organization.id,
      },
      include: {
        stripe_payment_method: true,
      },
    });
    let stripeCustomerId: string | undefined;
    if (!paymentMethod) {
      const stripeCustomer = await createStripeCustomer({
        email: ctx.user.organization.bill_email || ctx.user.email,
        name: ctx.user.organization.bill_name || getUserFullName(ctx.user),
        address: {
          address_line1: ctx.user.organization.billing_address?.address_line1 || '',
          address_line2: ctx.user.organization.billing_address?.address_line1 || '',
          city: ctx.user.organization.billing_address?.city || '',
          state: ctx.user.organization.billing_address?.state || '',
          postal_code: ctx.user.organization.billing_address?.postal_code || '',
          country: ctx.user.organization.billing_address?.country || '',
        },
        entityId: ctx.user.organization.id,
        entityType: 'organization',
      });
      stripeCustomerId = stripeCustomer.id;
    } else {
      stripeCustomerId = paymentMethod.stripe_customer_id;
    }

    return await createPaymentMethod({
      entityType: 'organization',
      entityId: ctx.user.organization_id,
      stripeCustomerId: stripeCustomerId,
      stripePaymentMethodId: input.stripePaymentMethodId,
    });

  });
