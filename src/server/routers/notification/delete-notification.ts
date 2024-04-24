import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';

const deleteNotification = isAuthenticated
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    return prisma.notification.update({
      where: {
        id: input.id,
      },
      data: {
        deleted: true,
      },
    });
  });

export default deleteNotification;
