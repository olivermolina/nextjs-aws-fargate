import z from 'zod';
import loadPusher from 'src/libs/pusher';
import { TRPCError } from '@trpc/server';
import prisma from '../../../libs/prisma';
import { publicProcedure } from '../../trpc';

const signIn = publicProcedure
  .input(
    z.object({
      socketId: z.string(),
      userId: z.string(),
      channelName: z.string().optional(),
      watchlist: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const { socketId, userId } = input;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    const pusher = loadPusher();

    if (input.channelName) {
      return pusher.authorizeChannel(socketId, input.channelName, {
        user_id: user.id,
        user_info: user,
      });
    }

    const watchlist = input.watchlist?.split(',').filter((w) => w !== user.id);

    return pusher.authenticateUser(socketId, {
      id: user.id,
      user_info: user,
      watchlist,
    });
  });

export default signIn;
