import Stripe from 'stripe';
import loadStripeClient from 'src/libs/stripe';
import prisma from 'src/libs/prisma';
import { TRPCError } from '@trpc/server';

type CreateStripeCustomer = {
  /**
   * The ID of the payment method
   */
  stripePaymentMethodId: string;
  /**
   * The ID of the user or organization
   */
  stripeCustomerId: string;
  /**
   * The type of entity (user or organization)
   */
  entityType: 'user' | 'organization';
  /**
   * The ID of the user or organization
   */
  entityId: string;
  /**
   * The Stripe account ID - An account id on whose behalf you wish to make a request.
   */
  stripeAccount?: string;
};

/**
 * Creates a Stripe customer and returns the Stripe customer object
 * @param input - The CreateStripeCustomer object
 *
 * @returns Stripe.Customer
 */
export const createPaymentMethod = async (input: CreateStripeCustomer) => {
  const { stripeCustomerId, stripePaymentMethodId, entityId, entityType, stripeAccount } = input;
  const stripe = loadStripeClient();
  let paymentMethod: Stripe.PaymentMethod | undefined;


  if (entityType === 'user' && !stripeAccount) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Stripe Account ID is required for user payment methods.',
    });
  }

  let options = entityType === 'user' ? {
    stripeAccount,
  } : undefined;

  try {
    paymentMethod = await stripe.paymentMethods.retrieve(stripePaymentMethodId, undefined, options);

    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: stripeCustomerId,
    }, options);

    // Set it as the default payment method
    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    }, options);
  } catch (e) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: e.message,
    });
  }

  if (!paymentMethod?.id) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Something went wrong creating your subscription. Please try again.',
    });
  }

  switch (entityType) {
    case 'organization':
      const isExistingPaymentMethod = await prisma.stripeOrganizationPaymentMethod.findFirst({
        where: {
          organization_id: entityId,
        },
      });
      if (isExistingPaymentMethod && isExistingPaymentMethod.stripe_payment_method_id) {
        await prisma.stripePaymentMethod.update({
          where: {
            id: isExistingPaymentMethod.stripe_payment_method_id,
          },
          data: {
            stripe_id: paymentMethod.id,
            brand: paymentMethod.card?.brand || '',
            last4: paymentMethod.card?.last4 || '',
          },
        });
      } else {
        await prisma.stripeOrganizationPaymentMethod.create({
          data: {
            stripe_customer_id: stripeCustomerId,
            organization: {
              connect: {
                id: entityId,
              },
            },
            stripe_payment_method: {
              create: {
                stripe_id: paymentMethod.id,
                brand: paymentMethod.card?.brand || '',
                last4: paymentMethod.card?.last4 || '',
              },
            },
          },
        });
      }
      break;
    case 'user':
      const isExistingUserPaymentMethod = await prisma.stripeUserPaymentMethod.findFirst({
        where: {
          user_id: entityId,
        },
      });
      if (isExistingUserPaymentMethod && isExistingUserPaymentMethod.stripe_payment_method_id) {
        await prisma.stripePaymentMethod.update({
          where: {
            id: isExistingUserPaymentMethod.stripe_payment_method_id,
          },
          data: {
            stripe_id: paymentMethod.id,
            brand: paymentMethod.card?.brand || '',
            last4: paymentMethod.card?.last4 || '',
          },
        });
      } else {
        await prisma.stripeUserPaymentMethod.create({
          data: {
            stripe_customer_id: stripeCustomerId,
            user: {
              connect: {
                id: entityId,
              },
            },
            stripe_payment_method: {
              create: {
                stripe_id: paymentMethod.id,
                brand: paymentMethod.card?.brand || '',
                last4: paymentMethod.card?.last4 || '',
              },
            },
          },
        });
      }

  }

  return paymentMethod;
};
