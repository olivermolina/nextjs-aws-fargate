import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';

const saveHeading = isAuthenticated
  .input(
    z.object({
      id: z.string(),
      value: z.string().optional().nullable(),
    }),
  )
  .mutation(async ({ input }) => {
    return prisma.chartHeading.update({
      where: {
        id: input.id,
      },
      data: {
        ...(input.value && { value: input.value }),
      },
    });
  });
export default saveHeading;
