import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import dayjs from 'dayjs';

const list = isAuthenticated
  .input(
    z.object({
      from: z.date().optional().nullable(),
      to: z.date().optional().nullable(),
      staffIds: z.array(z.string()).optional().nullable(),
      rowsPerPage: z.number().min(5).max(1000),
      page: z.number().min(0),
    })
  )
  .query(async ({ input, ctx }) => {
    const totalRowCount = await prisma.log.count({
      where: {
        staff: {
          organization_id: ctx.user.organization_id,
        },
        ...(input.staffIds && {
          staff_id: {
            in: input.staffIds,
          },
        }),
        ...(input.from &&
          input.to && {
            created_at: {
              gte: dayjs(input.from).set('hour', 0).set('minute', 0).set('second', 0).toDate(),
              lte: dayjs(input.to).set('hour', 23).set('minute', 59).set('second', 59).toDate(),
            },
          }),
      },
    });

    const logs = await prisma.log.findMany({
      skip: input.page * input.rowsPerPage,
      take: input.rowsPerPage,
      where: {
        staff: {
          organization_id: ctx.user.organization_id,
        },
        ...(input.staffIds && {
          staff_id: {
            in: input.staffIds,
          },
        }),
        ...(input.from &&
          input.to && {
            created_at: {
              gte: dayjs(input.from).set('hour', 0).set('minute', 0).set('second', 0).toDate(),
              lte: dayjs(input.to).set('hour', 23).set('minute', 59).set('second', 59).toDate(),
            },
          }),
      },
      orderBy: {
        created_at: 'desc',
      },
      include: {
        staff: true,
        sub_file: true,
        user: true,
      },
    });

    return {
      items: logs,
      meta: {
        totalRowCount,
      },
    };
  });

export default list;
