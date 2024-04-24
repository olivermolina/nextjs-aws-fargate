import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';

const listOptions = isAuthenticated.query(async ({ ctx }) => {
  return prisma.allergy.findMany({
    where: {
      user: {
        organization_id: ctx.user.organization_id,
      },
    },
    distinct: ['name'],
  });
});

export default listOptions;
