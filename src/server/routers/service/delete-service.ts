import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import prisma from '../../../libs/prisma';

export const deleteService = isAuthenticated
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    return prisma.service.delete({
      where: {
        id: input.id,
      },
    });
  });
