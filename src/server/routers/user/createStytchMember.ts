import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import prisma from 'src/libs/prisma';
import { TRPCError } from '@trpc/server';
import { createOrInviteStytchMember } from './createOrInviteStytchMember';

/**
 * Create a stytch member for a user
 *
 * @param id - The user id
 * @returns The user Object
 */

const createStytchMember = isAuthenticated
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: input.id,
      },
    });

    const stytchMember = await createOrInviteStytchMember({
      email: user.email,
      stytch_organization_id: ctx.user.organization.stytch_id,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      action: 'create',
    });

    if (!stytchMember) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: "Couldn't create the user. Please contact support.",
      });
    }

    return await prisma.user.update({
      where: {
        id: input.id,
      },
      data: {
        stytch_member_id: stytchMember.member_id,
      },
    });
  });

export default createStytchMember;
