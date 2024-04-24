import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import { LogAction } from '@prisma/client';

const deleteChart = isAuthenticated
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ input, ctx }) => {


    const [deletedChart] = await prisma.$transaction([
      prisma.chart.delete({
        where: {
          id: input.id,
        },
      }),
      prisma.notification.deleteMany({
        where: {
          chart_id: input.id,
        },
      }),
    ]);

    await prisma.log.create({
      data: {
        user_id: deletedChart.user_id,
        text: `the chart ${deletedChart.name}`,
        staff_id: ctx.user.id,
        chart_id: deletedChart.id,
        action: LogAction.DELETE,
      },
    });

    return deletedChart;
  });

export default deleteChart;
