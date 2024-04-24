import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';

const deleteHistory = isAuthenticated
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    return prisma.history.delete({
      where: {
        id: input.id,
      },
    });
  });

export default deleteHistory;
