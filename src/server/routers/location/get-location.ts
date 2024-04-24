import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import { TRPCError } from '@trpc/server';
import { isOwnedByOrganization } from '../../../utils/is-owned-by-organization';

const getLocation = isAuthenticated
  .input(
    z.object({
      id: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    const location = await prisma.location.findFirst({
      where: {
        id: input.id,
      },
    });

    if (!location) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Location not found',
      });
    }

    isOwnedByOrganization(ctx.user.organization_id, location);

    return location;
  });

export default getLocation;
