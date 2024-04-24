import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';

const currentVital = isAuthenticated
  .input(
    z.object({
      userId: z.string(),
    }),
  )
  .query(async ({ input }) => {
    return prisma.vital.findFirst({
      take: 1,
      where: {
        user_id: input.userId,
      },
      orderBy: {
        date: 'desc',
      },
    });
  });

export default currentVital;
