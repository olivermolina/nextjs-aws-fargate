import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import prisma from '../../../libs/prisma';
import { ServiceWithStaff } from '../../../types/service';
import { serviceSelect } from './index';

export const list = isAuthenticated
  .input(
    z.object({
      query: z.string().optional(),
      rowsPerPage: z.number().min(5).max(1000),
      page: z.number().min(0),
    }),
  )
  .query(async ({ input, ctx }) => {
    const totalRowCount = await prisma.service.count({
      where: {
        organization_id: ctx.user.organization_id,
        NOT: {
          type: 'custom',
        },
      },
    });

    const services = await prisma.service.findMany({
      skip: input.page * input.rowsPerPage,
      take: input.rowsPerPage,
      select: serviceSelect,
      where: {
        organization_id: ctx.user.organization_id,
        NOT: {
          type: 'custom',
        },
      },
    });

    return {
      items: services as ServiceWithStaff[],
      meta: {
        totalRowCount,
      },
    };
  });
