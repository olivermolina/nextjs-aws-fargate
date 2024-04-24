import { publicProcedure } from '../../trpc';
import z from 'zod';
import { AppAccess } from '@prisma/client';
import prisma from 'src/libs/prisma';

export const updateOrganizationAccess = publicProcedure
  .input(
    z.object({
      stripeCustomerId: z.string(),
      access: z.nativeEnum(AppAccess),
    })
  )
  .mutation(async ({ input }) => {
    const paymentMethod = await prisma.stripeOrganizationPaymentMethod.findFirstOrThrow({
      where: {
        stripe_customer_id: input.stripeCustomerId,
      },
    });

    return prisma.organization.update({
      where: {
        id: paymentMethod.organization_id,
      },
      data: {
        access: input.access,
      },
    });
  });
