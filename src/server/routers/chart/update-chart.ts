import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { UpdateChartSchema } from '../../../utils/zod-schemas/chart';
import { LogAction } from '@prisma/client';

const updateChart = isAuthenticated.input(UpdateChartSchema).mutation(async ({ input, ctx }) => {
  const { id, ...data } = input;

  const chart = await prisma.chart.update({
    where: {
      id,
    },
    data: {
      ...data,
      consultation_id: data.consultation_id || undefined,
      assigned_to_id: data.assigned_to_id || undefined,
    },
  });

  await prisma.log.create({
    data: {
      user_id: chart.user_id,
      text: `the chart ${chart.name}`,
      staff_id: ctx.user.id,
      chart_id: chart.id,
      action: LogAction.EDIT,
    },
  });

  return chart;
});

export default updateChart;
