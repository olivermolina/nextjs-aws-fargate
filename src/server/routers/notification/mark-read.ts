import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';

const markRead = isAuthenticated
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    return prisma.notification.update({
      where: {
        id: input.id,
      },
      data: {
        read: true,
      },
    });
  });

export default markRead;
