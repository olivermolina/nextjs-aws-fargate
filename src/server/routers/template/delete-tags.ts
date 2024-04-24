import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';

const deleteTags = isAuthenticated
  .input(
    z.object({
      tags: z.array(z.string()),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    return prisma.templateTag.deleteMany({
      where: {
        name: {
          in: input.tags,
        },
        organization_id: ctx.user.organization_id,
      },
    });
  });

export default deleteTags;
