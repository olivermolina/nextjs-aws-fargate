import prisma from 'src/libs/prisma';
import { publicProcedure } from '../../trpc';
import z from 'zod';
import { UserType } from '@prisma/client';

export const getOrganizationById = publicProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .query(async ({ input }) => {
    const organization = await prisma.organization.findUniqueOrThrow({
      where: {
        id: input.id,
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
        billing_address: true,
        StripeConnect: {
          select: {
            stripe_user_id: true,
          },
        },
        Tax: true,
      },
    });

    return organization;
  });
