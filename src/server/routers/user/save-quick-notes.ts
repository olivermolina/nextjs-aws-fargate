import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import prisma from 'src/libs/prisma';

const saveQuickNotes = isAuthenticated
  .input(
    z.object({
      id: z.string(),
      quick_notes: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    return prisma.user.update({
      where: {
        id: input.id,
      },
      data: {
        quick_notes: input.quick_notes,
      },
    });
  });

export default saveQuickNotes;
