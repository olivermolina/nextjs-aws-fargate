import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import { TRPCError } from '@trpc/server';

const getFax = isAuthenticated
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const fax = await prisma.fax.findUnique({
      where: {
        id: input.id,
      },
      include: {
        staff: true,
      },
    });

    if (!fax) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Allergy not found',
      });
    }


    return fax;
  });

export default getFax;
