import prisma from '../../../libs/prisma';
import z from 'zod';
import { publicProcedure } from '../../trpc';

const listByOrganizationId = publicProcedure
  .input(
    z.object({
      organizationId: z.string(),
      tags: z.array(z.string()).optional(),
    }),
  )
  .query(async ({ input }) => {
    return prisma.template.findMany({
      where: {
        organization_id: input.organizationId,
        tags: {
          hasEvery: input.tags,
        },
      },
    });
  });

export default listByOrganizationId;
