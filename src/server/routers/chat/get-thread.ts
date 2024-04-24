import z from 'zod';
import { isAuthenticated } from '../middleware/isAuthenticated';
import prisma from '../../../libs/prisma';
import { formatThread } from './threads';
import { TRPCError } from '@trpc/server';

const getThread = isAuthenticated
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(async ({ input, ctx }) => {

    const thread = await prisma.thread.findUnique({
      where: {
        id: input.id,
      },
      include: {
        messages: {
          include: {
            attachment: true,
          },
        },
      },
    });

    if (!thread) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Thread not found',
      });
    }

    return formatThread(thread);
  });
export default getThread;
