import { publicProcedure } from '../../trpc';
import z from 'zod';
import prisma from 'src/libs/prisma';
import { UserType } from '@prisma/client';

export const getOrganizationBySlug = publicProcedure
  .input(
    z.object({
      slug: z.string(),
    })
  )
  .query(async ({ input }) => {
    return prisma.organization.findUniqueOrThrow({
      where: {
        slug: input.slug,
      },
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
    });
  });
