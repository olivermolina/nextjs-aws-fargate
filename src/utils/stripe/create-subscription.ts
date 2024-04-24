import Stripe from 'stripe';
import loadStripeClient from 'src/libs/stripe';
import { TRPCError } from '@trpc/server';

type CreateStripeSubscription = {
  /**
   * The Stripe customer ID
   */
  stripeCustomerId: string;
  /**
   * The subscription ID to create the subscription for
   */
  subscriptionId: string;
  /**
   * The number of additional users to add to the subscription
   */
  additionalUsers: number;
  /**
   * The promotion code to apply to the subscription
   */
  promotionCode?: string;
  /**
   * The default payment method ID to use for the subscription
   */
  defaultStripePaymentMethodId?: string;
};

/**
 * Creates a Stripe subscription and returns the Stripe subscription object
 * @param input - The CreateStripeSubscription object
 *
 * @returns Stripe.Subscription
 */
export const createSubscription = async (input: CreateStripeSubscription) => {
  const stripe = loadStripeClient();

  const products = await stripe.products.list({ expand: ['data.default_price'], active: true });

  const items = [];
  const subscriptionProduct = products.data.find((product) => product.id === input.subscriptionId);
  if (!subscriptionProduct) throw new Error('No product found');

  items.push({
    price: (subscriptionProduct.default_price as Stripe.Price)?.id,
    quantity: 1,
  });

  //Add additional users
  if (input.additionalUsers > 1) {
    const additionalUserProduct = products.data.find(
      (product) =>
        product.metadata?.type === 'additional_users'
    );
    if (!additionalUserProduct) throw new Error('No product found');
    items.push({
      price: (additionalUserProduct.default_price as Stripe.Price)?.id,
      quantity: input.additionalUsers - 1, // because the first user is included in the subscription
    });
  }

  if (!subscriptionProduct?.id) throw new Error('No product found');

  let subscription: Stripe.Subscription | undefined;

  const stripeCustomer = await stripe.customers.retrieve(input.stripeCustomerId);
  const defaultSource = (stripeCustomer as Stripe.Customer)?.default_source as string;

  try {
    subscription = await stripe.subscriptions.create({
      customer: input.stripeCustomerId,
      expand: ['latest_invoice.payment_intent'],
      items,
      collection_method: 'charge_automatically',
      payment_behavior: 'error_if_incomplete',
      trial_end: 'now',
      payment_settings: {
        payment_method_types: ['card'],
      },
      ...(input.promotionCode && { coupon: input.promotionCode }),
    });

    if (!input.promotionCode && defaultSource) {
      await stripe.invoices.pay(subscription.latest_invoice as string);
      await stripe.invoices.sendInvoice(subscription.latest_invoice as string);
    }
  } catch (e) {
    if (subscription) {
      await stripe.subscriptions.cancel(subscription.id as string);
      await stripe.invoices.del(subscription.latest_invoice as string);
    }
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: e.message,
    });
  }

  if (!subscription?.id) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Something went wrong creating your subscription. Please try again.',
    });
  }

  return subscription;
};
