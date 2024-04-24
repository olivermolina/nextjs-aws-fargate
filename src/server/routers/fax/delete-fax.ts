import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';

const deleteFax = isAuthenticated
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    return prisma.fax.delete({
      where: {
        id: input.id,
      },
    });
  });

export default deleteFax;
