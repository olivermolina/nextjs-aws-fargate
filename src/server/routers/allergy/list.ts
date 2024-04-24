import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';

const list = isAuthenticated
  .input(
    z.object({
      userId: z.string(),
    }),
  )
  .query(async ({ input }) => {
    return prisma.allergy.findMany({
      where: {
        user_id: input.userId,
      },
    });
  });

export default list;
