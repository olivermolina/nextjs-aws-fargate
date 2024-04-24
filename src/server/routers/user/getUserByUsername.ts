import { publicProcedure } from 'src/server/trpc';
import z from 'zod';
import prisma from 'src/libs/prisma';
import { UserType } from '@prisma/client';

/**
 * Get staff user by username
 *
 * @param username - The user id
 * @returns The user
 */
const getUserByUsername = publicProcedure
  .input(
    z.object({
      username: z.string(),
    })
  )
  .query(async ({ input }) => {
    return prisma.user.findUnique({
      where: {
        username: input.username,
      },
      include: {
        organization: {
          include: {
            Services: {
              where: {
                NOT: {
                  type: 'custom',
                },
              },
            },
            users: {
              where: {
                type: UserType.STAFF,
                active: true,
              },
            },
            Availabilities: {
              include: {
                availability_slots: true,
                user: true,
              },
            },
            address: true,
          },
        },
      },
    });
  });

export default getUserByUsername;
