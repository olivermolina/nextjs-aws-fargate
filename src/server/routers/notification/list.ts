import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';

const list = isAuthenticated.query(async ({ ctx }) => {
  const notifications = await prisma.notification.findMany({
    where: {
      to_user_id: ctx.user.id,
    },
    include: {
      Message: true,
      File: true,
      SubFile: true,
      Consultation: true,
      from_user: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  return notifications.filter((notification) => !notification.deleted);
});

export default list;
