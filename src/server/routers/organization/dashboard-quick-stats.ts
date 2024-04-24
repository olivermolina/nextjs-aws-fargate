import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import prisma from '../../../libs/prisma';
import dayjs from 'dayjs';

const dashboardQuickStats = isAuthenticated
  .input(
    z.object({
      from: z.string(),
      to: z.string(),
      staffId: z.string().optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    const start = dayjs(input.from);
    const end = dayjs(input.to);
    const daysDiff = end.diff(start, 'days');
    const prevStart = start.subtract(daysDiff, 'days');
    const prevEnd = end.subtract(daysDiff, 'day');

    const [
      incomeAggregations,
      consultationsCount,
      prevIncomeAggregations,
      prevConsultationsCount,
      consultationAggregations,
      patientCount,
    ] = await Promise.all([
      // Current period
      await prisma.invoice.groupBy({
        by: ['status'],
        where: {
          patient: {
            organization_id: ctx.user.organization.id,
          },
          ...(input.staffId && {
            staffs: {
              some: {
                staff_id: input.staffId,
              },
            },
          }),
          created_at: {
            gte: new Date(input.from),
            lte: new Date(input.to),
          },
        },
        _sum: {
          total_amount: true,
        },
      }),
      await prisma.consultation.count({
        where: {
          user: {
            organization_id: ctx.user.organization.id,
          },
          ...(input.staffId && {
            staffs: {
              some: {
                staff_id: input.staffId,
              },
            },
          }),
          created_at: {
            gte: new Date(input.from),
            lte: new Date(input.to),
          },
        },
      }),

      // Previous period
      await prisma.invoice.groupBy({
        by: ['status'],
        where: {
          patient: {
            organization_id: ctx.user.organization.id,
          },
          ...(input.staffId && {
            staffs: {
              some: {
                staff_id: input.staffId,
              },
            },
          }),
          created_at: {
            gte: prevStart.toDate(),
            lte: prevEnd.toDate(),
          },
        },
        _sum: {
          total_amount: true,
        },
      }),
      await prisma.consultation.count({
        where: {
          user: {
            organization_id: ctx.user.organization.id,
          },
          ...(input.staffId && {
            staffs: {
              some: {
                staff_id: input.staffId,
              },
            },
          }),
          created_at: {
            gte: prevStart.toDate(),
            lte: prevEnd.toDate(),
          },
        },
      }),

      // Consultations by status
      await prisma.consultation.groupBy({
        by: ['status'],
        where: {
          user: {
            organization_id: ctx.user.organization.id,
          },
          ...(input.staffId && {
            staffs: {
              some: {
                staff_id: input.staffId,
              },
            },
          }),
          created_at: {
            gte: new Date(input.from),
            lte: new Date(input.to),
          },
        },
        _count: {
          status: true,
        },
      }),

      // Patients count
      await prisma.user.count({
        where: {
          organization_id: ctx.user.organization.id,
          ...(input.staffId && {
            staffs: {
              some: {
                staffId: input.staffId,
              },
            },
          }),
          created_at: {
            gte: new Date(input.from),
            lte: new Date(input.to),
          },
        },
      }),
    ]);
    return {
      incomeAggregations,
      consultationsCount,
      patientCount,
      consultationAggregations,
      prevIncomeAggregations,
      prevConsultationsCount,
    };
  });

export default dashboardQuickStats;
