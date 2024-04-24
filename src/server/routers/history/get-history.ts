import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import { TRPCError } from '@trpc/server';
import { isOwnedByOrganization } from '../../../utils/is-owned-by-organization';

const getHistory = isAuthenticated
  .input(
    z.object({
      id: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    const history = await prisma.history.findFirst({
      where: {
        id: input.id,
      },
      include: {
        user: true,
      },
    });

    if (!history) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'History not found',
      });
    }

    isOwnedByOrganization(ctx.user.organization_id, history.user);

    return history;
  });

export default getHistory;
