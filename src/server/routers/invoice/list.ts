import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import { InvoiceStatus, Prisma } from '@prisma/client';
import prisma from '../../../libs/prisma';
import { invoiceSelect } from './invoice-select';
import { Invoice } from '../../../types/invoice';

export const list = isAuthenticated
  .input(
    z.object({
      query: z.string().optional(),
      rowsPerPage: z.number().min(5),
      page: z.number().min(0),
      from: z.string().optional(),
      to: z.string().optional(),
      status: z.nativeEnum(InvoiceStatus).optional(),
      userIds: z.array(z.string()).optional(),
      groupByStatus: z.boolean().optional(),
      staffId: z.string().optional(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const where: Prisma.InvoiceWhereInput = {
      ...(input.status !== undefined && { status: input.status }),
      ...(!!input.query && { invoice_number: { contains: input.query } }),
      patient: {
        is: {
          organization_id: ctx.user.organization_id,
          ...(!!input.userIds &&
            input.userIds.length && {
              id: {
                in: input.userIds,
              },
            }),
        },
      },
      ...(!!input.from && {
        created_at: {
          gte: new Date(input.from),
        },
      }),
      ...(!!input.to && {
        created_at: {
          lte: new Date(input.to),
        },
      }),
      ...(input.staffId && {
        staffs: {
          some: {
            staff_id: input.staffId,
          },
        },
      }),
    };

    const totalRowCount = await prisma.invoice.count({
      where,
    });

    const invoices = await prisma.invoice.findMany({
      skip: input.page * input.rowsPerPage,
      take: input.rowsPerPage,
      where,
      ...(input.groupByStatus && {
        orderBy: {
          status: Prisma.SortOrder.asc,
        },
      }),
      select: invoiceSelect,
    });

    return {
      items: invoices as Invoice[],
      meta: {
        totalRowCount,
      },
    };
  });
