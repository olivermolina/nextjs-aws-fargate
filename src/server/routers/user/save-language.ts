import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import prisma from 'src/libs/prisma';

const saveLanguage = isAuthenticated
  .input(
    z.object({
      language: z.enum(['en', 'es']),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    return prisma.user.update({
      where: {
        id: ctx.user.id,
      },
      data: {
        language: input.language,
      },
    });
  });

export default saveLanguage;
