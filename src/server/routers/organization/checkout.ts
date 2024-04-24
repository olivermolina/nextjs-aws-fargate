import { isAuthenticated } from '../middleware/isAuthenticated';
import prisma from 'src/libs/prisma';
import { TRPCError } from '@trpc/server';
import { AppAccess, RoleName, Status } from '@prisma/client';
import { createStripeCustomer } from 'src/utils/stripe/create-customer';
import { createSubscription } from 'src/utils/stripe/create-subscription';
import { CheckoutBillingValidationSchema } from 'src/utils/zod-schemas/checkout';
import { createPaymentMethod } from 'src/utils/stripe/create-payment-method';

export const checkout = isAuthenticated
  .input(CheckoutBillingValidationSchema)
  .mutation(async ({ input, ctx }) => {
    try {
      await prisma.user.findUniqueOrThrow({
        where: {
          id: ctx.user.id,
          role: {
            name: RoleName.ADMIN
          }
        },
      });
    } catch (e) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'You are not authorized to perform this action',
      });
    }

    const billName = input.bill_first_name + ' ' + input.bill_last_name;

    const result = await createStripeCustomer({
      entityId: ctx.user.organization_id,
      entityType: 'organization',
      email: input.bill_email,
      name: billName,
      address: input.address,
      promotionCode: input.promotionCode,
    });

    if (!result.id) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Something went wrong creating your subscription. Please try again.',
      });
    }

    let defaultStripePaymentMethodId = '';
    if (input.stripePaymentMethodId) {
      // Assign default payment method if provided to the customer
      const stripePaymentMethod = await createPaymentMethod({
        entityType: 'organization',
        entityId: ctx.user.organization_id,
        stripeCustomerId: result.id,
        stripePaymentMethodId: input.stripePaymentMethodId,
      });
      defaultStripePaymentMethodId = stripePaymentMethod.id;
    }

    const subscription = await createSubscription({
      stripeCustomerId: result.id,
      additionalUsers: input.additionalUsers,
      promotionCode: input.promotionCode,
      subscriptionId: input.subscriptionId,
      defaultStripePaymentMethodId,
    });

    const appAccess = subscription.status === 'active' ? AppAccess.Allow : AppAccess.Block;

    return prisma.organization.update({
      where: {
        id: ctx.user.organization_id,
      },
      data: {
        bill_name: billName,
        bill_email: input.bill_email,
        stripe_subscription_id: subscription.id,
        additional_users: input.additionalUsers,
        billing_address: {
          create: {
            address_line1: input.address.address_line1,
            address_line2: input.address.address_line2,
            city: input.address.city,
            state: input.address.state,
            postal_code: input.address.postal_code,
            country: input.address.country || '',
          },
        },
        status: Status.COMPLETED,
        access: appAccess
      },
    });
  });
