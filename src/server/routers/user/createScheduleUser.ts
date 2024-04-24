import z from 'zod';
import { UserType } from '@prisma/client';
import prisma from 'src/libs/prisma';
import { TRPCError } from '@trpc/server';
import { userSelect } from './listUsers';
import { User } from 'src/types/user';
import { createUniqueUsername } from 'src/utils/create-unique-username';
import { publicProcedure } from '../../trpc';
import { createOrInviteStytchMember } from './createOrInviteStytchMember';

const createScheduleUser = publicProcedure
  .input(
    z.object({
      email: z.string().email({
        message: 'Invalid email. Please enter a valid email address',
      }),
      staffId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const staff = await prisma.user.findUnique({
      where: {
        id: input.staffId,
      },
    });

    if (!staff) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Staff not found',
      });
    }

    const userExist = await prisma.user.findFirst({
      where: {
        email: input.email,
        organization_id: staff.organization_id,
      },
    });

    if (userExist) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Cannot add that user, the email already exists.',
      });
    }
    const username = await createUniqueUsername({
      email: input.email,
    });

    const newUser = await prisma.user.create({
      data: {
        email: input.email,
        username,
        organization_id: staff.organization_id,
        stytch_member_id: '',
        first_name: '',
        last_name: '',
        type: UserType.PATIENT,
        avatar: '',
        phone: '',
        password_hash: '',
        active: false,
      },
      include: {
        organization: true,
      },
    });

    await prisma.userStaffs.create({
      data: {
        userId: newUser.id,
        staffId: input.staffId,
      },
    });

    if (!newUser) {
      throw new TRPCError({
        code: 'CONFLICT',
      });
    }

    const stytchMember = await createOrInviteStytchMember({
      email: newUser.email,
      stytch_organization_id: newUser.organization.stytch_id,
      action: 'create',
      first_name: '',
      last_name: '',
    });

    return (await prisma.user.update({
      where: { id: newUser.id },
      data: {
        stytch_member_id: stytchMember?.member_id,
      },
      select: userSelect,
    })) as User;
  });

export default createScheduleUser;
