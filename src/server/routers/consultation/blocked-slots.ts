import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import prisma from 'src/libs/prisma';
import dayjs from 'dayjs';

export const blockedSlots = isAuthenticated
  .input(z.object({
    from: z.string().optional(),
    to: z.string().optional(),
  }))
  .query(async ({ ctx, input }) => {
    const fromDate = input.from ? new Date(input.from) : dayjs().endOf('month').toDate();
    const toDate = input.to ? new Date(input.to) : dayjs().startOf('month').toDate();

    return prisma.blockedSlot.findMany({
      where: {
        user_id: ctx.user?.id,
        start_time: {
          gte: fromDate,
        },
        end_time: {
          lte: toDate,
        },
      },
      include: {
        user: true,
      },
    });
  });
