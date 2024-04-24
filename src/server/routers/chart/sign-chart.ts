import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';

const signChart = isAuthenticated
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const { id } = input;

    return prisma.chart.update({
      where: {
        id,
      },
      data: {
        signed_by_id: ctx.user.id,
        signed_at: new Date(),
      },
    });
  });

export default signChart;
