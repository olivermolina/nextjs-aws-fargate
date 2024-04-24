import prisma from '../../../libs/prisma';
import z from 'zod';
import { publicProcedure } from '../../trpc';

const getLocationByOrganizationId = publicProcedure
  .input(
    z.object({
      organization_id: z.string(),
    }),
  )
  .query(async ({ input }) => {
    return prisma.location.findMany({
      where: {
        organization_id: input.organization_id,
      },
    });
  });

export default getLocationByOrganizationId;
