import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import { isOwnedByOrganization } from '../../../utils/is-owned-by-organization';
import { TRPCError } from '@trpc/server';

const getAllergy = isAuthenticated
  .input(
    z.object({
      id: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    const allergy = await prisma.allergy.findUnique({
      where: {
        id: input.id,
      },
      include: {
        user: true,
      },
    });

    if (!allergy) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Allergy not found',
      });
    }

    isOwnedByOrganization(ctx.user.organization_id, allergy.user);

    return allergy;
  });

export default getAllergy;
