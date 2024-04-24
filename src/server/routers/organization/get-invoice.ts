import { isAuthenticated } from '../middleware/isAuthenticated';

import loadStripeClient from 'src/libs/stripe';
import z from 'zod';

export const invoice = isAuthenticated
  .input(
    z.object({
      id: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    const stripe = loadStripeClient();
    return await stripe.invoices.retrieve(input.id);
  });
