import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';

const saveChartItemOrder = isAuthenticated
  .input(
    z.array(
      z.object({
        id: z.string(),
        order: z.number(),
      }),
    ),
  )
  .mutation(async ({ input }) => {
    return prisma.$transaction(
      input.map((item) => {
        return prisma.chartItem.update({
          where: {
            id: item.id,
          },
          data: {
            order: item.order,
          },
        });
      }),
    );
  });
export default saveChartItemOrder;
