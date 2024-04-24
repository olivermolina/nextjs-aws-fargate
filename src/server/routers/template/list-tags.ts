import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';

const listTags = isAuthenticated
  .query(async ({ ctx }) => {
    return prisma.templateTag.findMany({
      where: {
        organization_id: ctx.user.organization_id,
      },
    });
  });

export default listTags;
