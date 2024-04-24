import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';

const deleteChiefComplaint = isAuthenticated
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    return prisma.chiefComplaint.delete({
      where: {
        id: input.id,
      },
    });
  });
export default deleteChiefComplaint;
