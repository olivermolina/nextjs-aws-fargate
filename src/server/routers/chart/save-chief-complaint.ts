import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';

const saveChiefComplaint = isAuthenticated
  .input(
    z.object({
      id: z.string(),
      value: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    return prisma.chiefComplaint.update({
      where: {
        id: input.id,
      },
      data: {
        value: input.value,
      },
    });
  });
export default saveChiefComplaint;
