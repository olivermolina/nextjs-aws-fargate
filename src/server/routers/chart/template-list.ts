import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';

const templateList = isAuthenticated.query(async ({ ctx }) => {
  return prisma.chartTemplate.findMany({
    where: {
      OR: [
        {
          created_by_id: ctx.user.id,
        },
        {
          shared: {
            has: 'public',
          },
        },
        {
          shared: {
            has: 'organization',
          },
          organization_id: ctx.user.organization_id,
        },
      ],
    },
    include: {
      created_by: true,
    },
  });
});

export default templateList;
