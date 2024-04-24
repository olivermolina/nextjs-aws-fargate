import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';

const deleteBodyChart = isAuthenticated
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    return prisma.bodyChart.delete({
      where: {
        id: input.id,
      },
    });
  });
export default deleteBodyChart;
