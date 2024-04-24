import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import { TRPCError } from '@trpc/server';
import { isOwnedByOrganization } from '../../../utils/is-owned-by-organization';

const getVital = isAuthenticated
  .input(
    z.object({
      id: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    const vital = await prisma.vital.findFirstOrThrow({
      where: {
        id: input.id,
      },
      include: {
        user: true,
      },
    });

    if (!vital) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Vital not found',
      });
    }

    isOwnedByOrganization(ctx.user.organization_id, vital.user);
  });

export default getVital;
