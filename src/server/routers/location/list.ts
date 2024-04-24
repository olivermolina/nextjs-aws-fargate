import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';

const list = isAuthenticated.query(async ({ ctx }) => {
  return prisma.location.findMany({
    where: {
      organization_id: ctx.user.organization_id,
    },
  });
});

export default list;
