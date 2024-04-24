import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { CreateChartSchema } from '../../../utils/zod-schemas/chart';
import { addNotification } from '../notification/addNotification';
import { LogAction } from '@prisma/client';

const createChart = isAuthenticated.input(CreateChartSchema).mutation(async ({ input, ctx }) => {
  const chart = await prisma.chart.create({
    data: {
      name: input.name,
      type: input.type,
      user: {
        connect: {
          id: input.userId,
        },
      },
      created_by: {
        connect: {
          id: ctx.user.id,
        },
      },
      assigned_to: {
        connect: {
          id: ctx.user.id,
        },
      },
      ...(input.consultationId && {
        consultation: {
          connect: {
            id: input.consultationId,
          },
        },
      }),
      service_datetime: input.service_datetime,
    },
  });

  // If consultationId is not provided, create notification
  if (!input.consultationId) {
    await addNotification({
      organizationId: ctx.user.organization_id,
      toUserIds: [input.userId],
      notificationsCreateManyInput: {
        from_user_id: ctx.user.id,
        description: 'added a charting note',
        chart_id: chart.id,
      },
    });
  }

  await prisma.log.create({
    data: {
      user_id: input.userId,
      text: `the chart ${chart.name}`,
      staff_id: ctx.user.id,
      chart_id: chart.id,
      action: LogAction.CREATE,
    },
  });

  return chart;
});
export default createChart;
