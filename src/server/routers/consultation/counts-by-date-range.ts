import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import prisma from 'src/libs/prisma';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(weekOfYear);

const getWeekOfMonth = (date: Date) => {
  const firstDay = new Date(date.setDate(1)).getDay();
  const totalDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return Math.ceil((firstDay + totalDays) / 7);
};

export const countsByDateRange = isAuthenticated
  .input(
    z.object({
      from: z.string(),
      to: z.string(),
      staffId: z.string().optional(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const start = dayjs(input.from);
    const end = dayjs(input.to);
    const diffDays = end.diff(start, 'day');

    let seriesType: 'daily' | 'weekly' | 'monthly' = 'daily';
    let startFilter = start.toDate();
    let endFilter = end.toDate();
    let categories: string[] = [];
    if (diffDays <= 7) {
      startFilter = dayjs(start).startOf('week').toDate();
      endFilter = dayjs(start).endOf('week').toDate();
      categories = Array.from({ length: 7 }, (_, i) => {
        return dayjs(startFilter).add(i, 'day').format('YYYY-MM-DD');
      });
      seriesType = 'daily';
    } else if (diffDays <= 30) {
      startFilter = dayjs(start).startOf('month').toDate();
      endFilter = dayjs(start).endOf('month').toDate();
      const startOfMonth = dayjs(start).startOf('month');
      const weeksInMonth = getWeekOfMonth(startOfMonth.toDate());
      categories = Array.from({ length: weeksInMonth - 1 }, (_, i) => {
        return dayjs(startFilter).add(i, 'week').format('YYYY-MM-DD');
      });

      seriesType = 'weekly';
    } else {
      startFilter = dayjs(start).startOf('month').toDate();
      endFilter = dayjs(end).endOf('month').toDate();
      const monthDiff = end.diff(start, 'month');
      // categories are the months
      categories = Array.from({ length: monthDiff + 1 }, (_, i) => {
        return dayjs(startFilter).add(i, 'month').format('YYYY-MM-DD');
      });
      seriesType = 'monthly';
    }
    const consultations = await prisma.consultation.findMany({
      where: {
        user: {
          organization_id: ctx.user.organization.id,
        },
        created_at: {
          gte: startFilter,
          lte: endFilter,
        },
        ...(input.staffId && {
          staffs: {
            some: {
              staff: {
                id: {
                  in: [input.staffId],
                },
              },
            },
          },
        }),
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    const counts: { [key: string]: number } = {};
    categories.forEach((category) => {
      counts[category] = 0;
      if (seriesType === 'daily') {
        const start = dayjs(category);
        consultations.forEach((consultation) => {
          if (dayjs(consultation.created_at).isSame(start, 'day')) {
            counts[category] += 1;
          }
        });
      } else if (seriesType === 'weekly') {
        const start = dayjs(category);
        const end = dayjs(category).endOf('week');
        consultations.forEach((consultation) => {
          if (dayjs(consultation.created_at).isBetween(start, end, undefined, '[]')) {
            counts[category] += 1;
          }
        });
      } else {
        const start = dayjs(category);
        const end = dayjs(category).endOf('month');
        consultations.forEach((consultation) => {
          if (dayjs(consultation.created_at).isBetween(start, end, undefined, '[]')) {
            counts[category] += 1;
          }
        });
      }
    });

    return {
      categories,
      series: Object.values(counts),
      seriesType,
    };
  });
