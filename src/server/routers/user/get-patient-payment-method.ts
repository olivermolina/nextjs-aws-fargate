import prisma from 'src/libs/prisma';
import z from 'zod';
import loadStripeClient from '../../../libs/stripe';
import { publicProcedure } from '../../trpc';

const getPatientPaymentMethod = publicProcedure
  .input(z.object({
    id: z.string(),
  }))
  .query(async ({ input, ctx }) => {
    const userId = input.id;

    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });

    const stripe = loadStripeClient();
    const stripeConnect = await prisma.stripeConnect.findUniqueOrThrow({
      where: {
        organization_id: user.organization_id,
      },
    });

    const stripeUserPaymentMethod = await prisma.stripeUserPaymentMethod.findFirstOrThrow({
      where: {
        user_id: userId,
      },
      include: {
        stripe_payment_method: true,
      },
    });

    const customerStripePaymentMethods = await stripe.paymentMethods.list({
      customer: stripeUserPaymentMethod.stripe_customer_id,
      type: 'card',
    }, {
      stripeAccount: stripeConnect.stripe_user_id,
    });

    if (customerStripePaymentMethods.data.length === 0) {
      // Remove the payment method from the database
      await prisma.stripeUserPaymentMethod.deleteMany({
        where: {
          user_id: input.id,
        },
      });

      return null;
    }

    return stripeUserPaymentMethod;

  });

export default getPatientPaymentMethod;
