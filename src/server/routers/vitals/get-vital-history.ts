import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import { Prisma } from '@prisma/client';

const getVitalHistory = isAuthenticated
  .input(
    z.object({
      userId: z.string(),
      name: z.nativeEnum(Prisma.VitalScalarFieldEnum),
    }),
  )
  .query(async ({ input }) => {
    return prisma.vital.groupBy({
      by: [input.name, 'date'],
      where: {
        user_id: input.userId,
      },
      orderBy: {
        date: 'asc',
      },
    });
  });

export default getVitalHistory;
