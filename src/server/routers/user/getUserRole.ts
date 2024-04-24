import z from 'zod';
import prisma from 'src/libs/prisma';
import { TRPCError } from '@trpc/server';
import { isOwnedByOrganization } from '../../../utils/is-owned-by-organization';
import { isAuthenticated } from '../middleware/isAuthenticated';

const getUserRole = isAuthenticated
  .input(
    z.object({
      id: z.string(),
      organization_id: z.string().optional(),
    }),
  )
  .query(async ({ input }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: input.id,
      },
      include: {
        role: {
          include: {
            role_permissions: {
              include: {
                resource: true,
                permission: true,
              },
            },
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

    if (input.organization_id) {
      isOwnedByOrganization(input.organization_id, user);
    }

    return user;
  });

export default getUserRole;
