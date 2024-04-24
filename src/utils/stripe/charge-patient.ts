import loadStripeClient from 'src/libs/stripe';
import { TRPCError } from '@trpc/server';

type ChargePatientInput = {
  // Stripe customer id of the patient
  stripeCustomerId: string;
  // Stripe account id of the organization
  stripeAccountId: string;
  // Stripe payment method id of the patient
  stripePaymentMethodId: string;
  // Amount to charge in cents
  amount: number;
  // Organization currency
  currency: 'can' | 'usd' | 'mex';
}

export const chargePatient = async (input: ChargePatientInput) => {
  const stripe = loadStripeClient();
  try {
    return await stripe.paymentIntents.create(
      {
        confirm: true,
        amount: input.amount,
        currency: input.currency,
        customer: input.stripeCustomerId,
        payment_method: input.stripePaymentMethodId,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
      },
      {
        stripeAccount: input.stripeAccountId,
      },
    );
  } catch (e) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: e.message,
    });
  }
};
