import { publicProcedure } from 'src/server/trpc';
import z from 'zod';
import prisma from 'src/libs/prisma';
import { userSelect } from './listUsers';
import { User } from 'src/types/user';
import { TRPCError } from '@trpc/server';
import { isOwnedByOrganization } from '../../../utils/is-owned-by-organization';

/**
 * Get user by id
 *
 * @param id - The user id
 * @returns The user
 */
const getUser = publicProcedure
  .input(
    z.object({
      id: z.string(),
      organization_id: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    const user = (await prisma.user.findUnique({
      where: {
        id: input.id,
      },
      select: userSelect,
    })) as User;

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

export default getUser;
