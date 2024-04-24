import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';

const shareChartTemplate = isAuthenticated
  .input(
    z.object({
      id: z.string(),
      shared: z.array(z.enum(['organization', 'public'])),
    }),
  )
  .mutation(async ({ input }) => {
    return prisma.chartTemplate.update({
      where: {
        id: input.id,
      },
      data: {
        shared: input.shared,
      },
    });
  });
export default shareChartTemplate;
