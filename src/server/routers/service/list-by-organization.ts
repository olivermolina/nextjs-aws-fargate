import { publicProcedure } from '../../trpc';
import z from 'zod';
import prisma from '../../../libs/prisma';
import { serviceSelect } from './index';

export const listByOrganization = publicProcedure
  .input(
    z.object({
      organizationId: z.string(),
    }),
  )
  .query(async ({ input }) => {
    return await prisma.service.findMany({
      select: serviceSelect,
      where: {
        organization_id: input.organizationId,
        NOT: {
          type: 'custom',
        },
      },
    });
  });
