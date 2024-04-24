import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';

const saveRange = isAuthenticated
  .input(
    z.object({
      id: z.string(),
      label: z.string().optional().nullable(),
      value: z.string().optional().nullable(),
      options: z.array(z.string()).optional().nullable(),
      default_value: z.string().optional().nullable(),
    }),
  )
  .mutation(async ({ input }) => {
    return prisma.chartRange.update({
      where: {
        id: input.id,
      },
      data: {
        ...(input.label && { label: input.label }),
        ...(input.value && { value: input.value }),
        ...(input.options && { options: input.options }),
        ...(input.default_value && { default_value: input.default_value }),
      },
    });
  });
export default saveRange;
