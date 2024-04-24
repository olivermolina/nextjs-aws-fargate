import { publicProcedure } from '../../trpc';
import loadStripeClient from 'src/libs/stripe';

export const plans = publicProcedure.query(async () => {
  const stripe = loadStripeClient();

  const products = await stripe.products.list({ expand: ['data.default_price'], active: true });

  return products.data;
});
