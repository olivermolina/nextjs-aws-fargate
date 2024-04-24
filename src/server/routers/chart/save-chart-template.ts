import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import { innerFunction as getChart } from './get-chart';
import { TRPCError } from '@trpc/server';

const saveChartTemplate = isAuthenticated
  .input(
    z.object({
      chartId: z.string(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const chart = await getChart(input.chartId, ctx.user.organization_id);

    if (!chart) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Chart not found. Unable to save as template.',
      });
    }

    return prisma.chartTemplate.create({
      data: {
        title: chart.name,
        items: chart.items,
        created_by_id: ctx.user.id,
        organization_id: ctx.user.organization_id,
      },
    });


  });
export default saveChartTemplate;
