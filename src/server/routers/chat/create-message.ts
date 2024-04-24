import z from 'zod';
import { isAuthenticated, UpdatedContext } from '../middleware/isAuthenticated';
import loadPusher from 'src/libs/pusher';
import { TRPCError } from '@trpc/server';
import prisma from '../../../libs/prisma';
import { PrismaClient, UserType } from '@prisma/client';
import { formatMessage } from './threads';
import {
  patientNewMessageNotification,
  staffNewMessageNotification,
} from '../../../utils/send-mail';
import { addNotification } from '../notification/addNotification';

type CreateMessageInput = {
  threadId?: string;
  body: string;
  toUserId: string;
  attachmentId?: string;
  contentType?: string;
  context: UpdatedContext;
  client: PrismaClient;
  status?: 'online' | 'offline';
};

export const innerFunction = async (inputs: CreateMessageInput) => {
  const {
    threadId,
    body,
    toUserId,
    attachmentId,
    context,
    contentType = 'text',
    client,
    status,
  } = inputs;

  const toUser = await client.user.findUnique({
    where: {
      id: toUserId,
    },
    include: {
      organization: true,
    },
  });

  if (!toUser) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'User not found',
    });
  }

  if (threadId) {
    const thread = await prisma.thread.findUnique({
      where: {
        id: threadId,
      },
    });

    if (!thread) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Thread not found',
      });
    }
  }

  const patient = toUser.type === UserType.PATIENT ? toUser : context.user;
  const staff = toUser.type === UserType.STAFF ? toUser : context.user;
  const pusher = loadPusher();

  const channel = `private-${patient.id}-${staff.id}`;

  const message = await client.message.create({
    data: {
      user: {
        connect: {
          id: context.user.id,
        },
      },
      thread: {
        ...(threadId
          ? {
            connect: {
              id: threadId,
            },
          }
          : {
            create: {
              title: channel,
              participantIds: [patient.id, staff.id],
            },
          }),
      },
      text: body,
      contentType: contentType || 'text',
      ...(attachmentId && {
        attachment: {
          connect: {
            id: attachmentId,
          },
        },
      }),
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

  // Send message to the channel
  const formattedMessage = await formatMessage(message);
  const messageResponse = await pusher.trigger(channel, 'luna-new-message-event', formattedMessage);

  if (messageResponse.status !== 200) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: messageResponse.statusText,
    });
  }

  // Notify recipient
  if (status === 'offline' && threadId) {
    // TODO: Send push notification
    if (toUser.type === UserType.STAFF) {
      staffNewMessageNotification(staff, patient, threadId);
    }

    if (toUser.type === UserType.PATIENT) {
      patientNewMessageNotification(staff, patient, threadId);
    }
    // Create notification
    await addNotification({
      organizationId: context.user.organization_id,
      toUserIds: [toUser.id],
      notificationsCreateManyInput: {
        from_user_id: context.user.id,
        message_id: message.id,
        description: 'sent a message',
      },
    });
  }

  return formattedMessage;
};

const createMessage = isAuthenticated
  .input(
    z.object({
      threadId: z.string().optional(),
      body: z.string(),
      toUserId: z.string(),
      status: z.enum(['online', 'offline']),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    return innerFunction({
      ...input,
      context: ctx,
      client: prisma,
    });
  });
export default createMessage;
