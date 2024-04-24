import { publicProcedure } from 'src/server/trpc';
import z from 'zod';
import prisma from 'src/libs/prisma';
import { userSelect } from './listUsers';
import { User } from 'src/types/user';
import { decode } from '../../../utils/jwt';
import { TRPCError } from '@trpc/server';

const getUserByToken = publicProcedure
  .input(
    z.object({
      token: z.string(),
    }),
  )
  .query(async ({ input }) => {
    let userId: null | string = null;

    try {
      const decodedToken = decode(input.token) as any;

      userId = decodedToken.userId;
    } catch (e) {
      throw new TRPCError({
        code: 'TIMEOUT',
        message: 'Invitation expired. Please contact your clinic to resend the invitation.',
      });
    }

    if (!userId) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Couldn\'t find the user. Invalid token',
      });
    }

    return (await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: userSelect,
    })) as User;
  });

export default getUserByToken;
