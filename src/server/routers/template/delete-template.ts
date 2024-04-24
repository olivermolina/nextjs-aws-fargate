import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';

const deleteTemplate = isAuthenticated
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    return prisma.template.delete({
      where: {
        id: input.id,
      },
    });
  });

export default deleteTemplate;
