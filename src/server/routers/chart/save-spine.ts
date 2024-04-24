import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import { Prisma } from '@prisma/client';

const saveSpine = isAuthenticated
  .input(
    z.object({
      id: z.string(),
      value: z.array(z.string()).optional().nullable(),
      label: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
      canvas: z.string().optional().nullable(),
    }),
  )
  .mutation(async ({ input }) => {
    return prisma.chartSpine.update({
      where: {
        id: input.id,
      },
      data: {
        ...(input.value && { value: input.value as Prisma.JsonArray }),
        ...(input.label && { label: input.label }),
        ...(input.notes && { notes: input.notes }),
        ...(input.canvas && { canvas: input.canvas }),
      },
    });
  });
export default saveSpine;
