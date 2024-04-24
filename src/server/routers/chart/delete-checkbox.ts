import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';

const deleteCheckBox = isAuthenticated
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    return prisma.chartCheckBox.delete({
      where: {
        id: input.id,
      },
    });
  });
export default deleteCheckBox;
