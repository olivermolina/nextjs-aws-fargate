import z from 'zod';
import prisma from 'src/libs/prisma';
import { TRPCError } from '@trpc/server';
import { isOwnedByOrganization } from '../../../utils/is-owned-by-organization';
import { isAuthenticated } from '../middleware/isAuthenticated';

const getUserStaff = isAuthenticated
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: input.id,
      },
      include: {
        staffs: {
          include: {
            staff: true,
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    if (ctx.user.organization_id) {
      isOwnedByOrganization(ctx.user.organization_id, user);
    }

    return user;
  });

export default getUserStaff;
