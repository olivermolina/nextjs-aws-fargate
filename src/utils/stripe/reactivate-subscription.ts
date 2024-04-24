import Stripe from 'stripe';
import loadStripeClient from 'src/libs/stripe';
import { TRPCError } from '@trpc/server';

/**
 * Reactivate a subscription if status is not active and pay the invoice if it is unpaid
 * @param subscriptionId
 *
 * @returns Stripe.Subscription
 */

export const reactivateSubscription = async (subscriptionId: string) => {
  const stripe = loadStripeClient();

  let subscription: Stripe.Subscription | undefined;
  try {
    subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['latest_invoice'],
    });

    if (subscription.status === 'canceled') {
      throw new Error('Subscription is canceled. Please create a new subscription.');
    }

    const invoice = subscription.latest_invoice as Stripe.Invoice;

    // If the invoice is unpaid, pay it
    if (invoice.status === 'open') {
      // Pay invoice
      const paidInvoice = await stripe.invoices.pay(invoice.id);
      if (paidInvoice.status === 'paid' && subscription.status === 'paused') {
        // Resume the subscription if it was paused
        subscription = await stripe.subscriptions.resume(subscriptionId);
      }
    }

  } catch (e) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: e.message,
    });
  }

  return subscription;
};
