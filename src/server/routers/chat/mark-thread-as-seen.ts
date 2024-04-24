import z from 'zod';
import { isAuthenticated } from '../middleware/isAuthenticated';
import loadPusher from 'src/libs/pusher';
import { TRPCError } from '@trpc/server';
import prisma from '../../../libs/prisma';
import { User, UserType } from '@prisma/client';
import { getUserFullName } from '../../../utils/get-user-full-name';
import { formatMessage } from './threads';

const markThreadAsSeen = isAuthenticated
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ input, ctx }) => {

    return prisma.thread.update({
      where: {
        id: input.id,
      },
      data: {
        unreadCount: 0,
      },
    });
  });
export default markThreadAsSeen;
