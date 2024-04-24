import Stripe from 'stripe';
import loadStripeClient from 'src/libs/stripe';
import prisma from 'src/libs/prisma';
import { AddressInput } from '../zod-schemas/address';
import { TRPCError } from '@trpc/server';

type CreateStripeCustomer = {
  /**
   * The ID of the user or organization
   */
  entityId: string;
  /**
   * The type of entity (user or organization)
   */
  entityType: 'user' | 'organization';
  /**
   * The name of the user or organization
   */
  name: string;
  /**
   * The email of the user or organization
   */
  email: string;
  /**
   * The address of the user or organization
   */
  address: AddressInput;
  /**
   * The promotion code to apply to the subscription
   */
  promotionCode?: string;
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

export const createStripeCustomer = async (input: CreateStripeCustomer) => {
  const { entityId, entityType, email, name, address, promotionCode } = input;

  if (entityType === 'user') {
    const userStripePaymentMethod = await prisma.stripeUserPaymentMethod.findFirst({
      where: {
        user: {
          id: entityId,
        },
      },
    });

    if (userStripePaymentMethod) {
      return userStripePaymentMethod;
    }
  } else if (entityType === 'organization') {
    const organizationStripePaymentMethod = await prisma.stripeOrganizationPaymentMethod.findFirst({
      where: {
        organization: {
          id: entityId,
        },
      },
    });

    if (organizationStripePaymentMethod) {
      return organizationStripePaymentMethod;
    }
  }

  const stripe = loadStripeClient();
  const { address_line1, address_line2, ...restAddress } = address;
  const params: Stripe.CustomerCreateParams = {
    description: entityId,
    email,
    name,
    address: {
      ...restAddress,
      line1: address_line1,
      line2: address_line2,
    },
    ...(promotionCode && { promotion_code: promotionCode }),
  };

  let customer: Stripe.Customer | undefined;

  if (!input.stripeAccount && entityType === 'user') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Stripe account is required for user',
    });
  }

  const options = entityType === 'user' ? {
    stripeAccount: input.stripeAccount,
  } : undefined;

  try {
    const customers = await stripe.customers.list({ email }, options);
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create(params, options);
    }
  } catch (e) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: e.message,
    });
  }

  if (!customer?.id) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Something went wrong. Please try again.',
    });
  }

  return customer;
};
