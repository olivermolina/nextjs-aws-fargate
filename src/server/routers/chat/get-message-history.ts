import z from 'zod';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { TRPCError } from '@trpc/server';
import prisma from '../../../libs/prisma';
import { formatThread } from './threads';

const getMessageHistory = isAuthenticated
  .input(
    z.object({
      patientId: z.string(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const thread = await prisma.thread.findFirst({
      where: {
        participantIds: {
          hasEvery: [input.patientId, ctx.user.id],
        },
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
        message: 'No messages found',
      });
    }

    return formatThread(thread);
  });
export default getMessageHistory;
