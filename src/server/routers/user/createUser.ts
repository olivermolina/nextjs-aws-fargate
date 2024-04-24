import { PatientValidationSchema } from 'src/types/patient';
import z from 'zod';
import { UserType } from '@prisma/client';
import prisma from 'src/libs/prisma';
import { TRPCError } from '@trpc/server';
import { userSelect } from './listUsers';
import { User } from 'src/types/user';
import { createUniqueUsername } from 'src/utils/create-unique-username';
import dayjs from 'dayjs';
import { publicProcedure } from '../../trpc';
import loadStytch from '../../../libs/stytch';

/**
 * Create user
 *
 * @param email - The user email
 * @param first_name - The user first name
 * @param last_name - The user last name
 * @param type - The user type
 * @param assignedStaffs - The user assigned staffs
 * @returns The user
 */

const createUser = publicProcedure
  .input(
    PatientValidationSchema.and(
      z.object({
        type: z.nativeEnum(UserType),
        timezone: z.string(),
        organization_id: z.string(),
      })
    )
  )
  .mutation(async ({ input }) => {
    const userExist = await prisma.user.findFirst({
      where: {
        email: input.email,
        organization_id: input.organization_id,
      },
    });

    if (userExist) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Cannot add that user, the email already exists.',
      });
    }
    const username = await createUniqueUsername(input);

    const newUser = await prisma.user.create({
      data: {
        email: input.email,
        username,
        organization_id: input.organization_id,
        stytch_member_id: '',
        first_name: input.first_name,
        last_name: input.last_name,
        type: input.type,
        phone: input.phone,
        password_hash: '',
        active: false,
      },
    });

    if (newUser && newUser.type === UserType.STAFF) {
      await prisma.availability.create({
        data: {
          user_id: newUser.id,
          organization_id: newUser.organization_id,
          name: 'Working Hours',
          timezone: input.timezone,
          availability_slots: {
            createMany: {
              data: [1, 2, 3, 4, 5].map((day) => ({
                day_of_week: day,
                start_time: dayjs.tz(input.timezone).hour(9).minute(0).second(0).toDate(),
                end_time: dayjs.tz(input.timezone).hour(17).minute(0).second(0).toDate(),
              })),
            },
          },
        },
      });
    }

    if (
      input.assignedStaffs &&
      Array.isArray(input.assignedStaffs) &&
      input.assignedStaffs.length > 0
    ) {
      await prisma.userStaffs.createMany({
        data: input.assignedStaffs.map((staffId) => ({
          userId: newUser.id,
          staffId: staffId,
        })),
      });
    }

    const user = (await prisma.user.findUnique({
      where: { id: newUser.id },
      select: userSelect,
    })) as User;

    if (!user) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'User not found.',
      });
    }

    try {
      const stytchB2BClient = loadStytch();

      const stytchUser = await stytchB2BClient.organizations.members.create({
        organization_id: user.organization.stytch_id,
        email_address: input.email,
        create_member_as_pending: true,
      });

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          stytch_member_id: stytchUser.member_id,
        },
      });

    } catch (e) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Couldn\'t create the user. Please contact support.',
      });
    }
    return user;
  });

export default createUser;
