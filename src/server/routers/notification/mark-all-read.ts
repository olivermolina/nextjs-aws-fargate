import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';

const markAllRead = isAuthenticated.mutation(async ({ ctx }) => {
  return prisma.notification.updateMany({
    where: {
      to_user_id: ctx.user.id,
    },
    data: {
      read: true,
    },
  });
});

export default markAllRead;
