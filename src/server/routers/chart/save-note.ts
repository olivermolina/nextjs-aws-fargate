import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';

const saveNote = isAuthenticated
  .input(
    z.object({
      id: z.string(),
      label: z.string().optional().nullable(),
      value: z.string().optional().nullable(),
    }),
  )
  .mutation(async ({ input }) => {
    return prisma.chartNote.update({
      where: {
        id: input.id,
      },
      data: {
        ...(input.label && { label: input.label }),
        ...(input.value && { value: input.value }),
      },
    });
  });
export default saveNote;
