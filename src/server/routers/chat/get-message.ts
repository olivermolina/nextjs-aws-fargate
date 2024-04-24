import z from 'zod';
import { isAuthenticated } from '../middleware/isAuthenticated';
import loadPusher from 'src/libs/pusher';
import { TRPCError } from '@trpc/server';
import prisma from '../../../libs/prisma';
import { User, UserType } from '@prisma/client';
import { getUserFullName } from '../../../utils/get-user-full-name';
import { formatMessage } from './threads';

const getMessage = isAuthenticated
  .input(
    z.object({
      id: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    const message = await prisma.message.findUnique({
      where: {
        id: input.id,
      },
      include: {
        attachment: true,
      },
    });

    if (!message) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not create message',
      });
    }

    return formatMessage(message);
  });
export default getMessage;
