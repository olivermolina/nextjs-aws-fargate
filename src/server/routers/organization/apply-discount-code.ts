import { publicProcedure } from '../../trpc';
import loadStripeClient from 'src/libs/stripe';
import z from 'zod';
import { TRPCError } from '@trpc/server';

export const applyDiscountCode = publicProcedure
  .input(
    z.object({
      code: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const stripe = loadStripeClient();

    const promotionCodes = await stripe.promotionCodes.list();

    const promotionCode = promotionCodes.data.find((value) => value.code === input.code);

    if (promotionCode === undefined) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Invalid promotion code',
      });
    }

    return promotionCode;
  });
