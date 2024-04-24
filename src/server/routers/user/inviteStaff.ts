import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import prisma from 'src/libs/prisma';
import { TRPCError } from '@trpc/server';
import { createOrInviteStytchMember } from './createOrInviteStytchMember';
import { RoleName, UserType } from '@prisma/client';
import { createUniqueUsername } from 'src/utils/create-unique-username';

/**
 * Invite a staff to the organization
 *
 * @param email - The user email
 *
 * @returns The user Object
 */
const inviteStaff = isAuthenticated
  .input(
    z.object({
      email: z.string(),
      roleName: z.nativeEnum(RoleName),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const staffMemberCount = await prisma.user.count({
      where: {
        organization_id: ctx.user.organization_id,
        type: UserType.STAFF,
      },
    });

    if (staffMemberCount >= Number(ctx.user.organization.additional_users)) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'You have reached the limit of staff members.',
      });
    }

    const userExist = await prisma.user.findFirst({
      where: {
        email: input.email,
        organization_id: ctx.user.organization_id,
      },
    });

    if (userExist) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Cannot add that user, the email already exists.',
      });
    }

    const stytchMember = await createOrInviteStytchMember({
      email: input.email,
      stytch_organization_id: ctx.user.organization.stytch_id,
      invited_by_member_id: ctx.user.stytch_member_id,
      action: 'invite',
    });

    if (!stytchMember) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Couldn\'t find the user. Please contact support.',
      });
    }

    const username = await createUniqueUsername({
      email: input.email,
    });

    const role = await prisma.role.findFirst({
      where: {
        name: input.roleName,
      },
    });

    return await prisma.user.create({
      data: {
        email: input.email,
        username,
        organization_id: ctx.user.organization_id,
        stytch_member_id: stytchMember.member_id,
        first_name: '',
        last_name: '',
        type: UserType.STAFF,
        active: false,
        password_hash: '',
        role_id: role?.id,
      },
    });
  });

export default inviteStaff;
