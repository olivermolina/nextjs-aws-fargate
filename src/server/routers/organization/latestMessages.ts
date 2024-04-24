import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import prisma from '../../../libs/prisma';
import { Message, MessageAttachment } from '@prisma/client';
import { getUserFullName } from '../../../utils/get-user-full-name';

const getMessageContent = (
  message: Message & {
    attachment: MessageAttachment | null;
  },
) => {
  if (message.attachment) {
    const extension = message.attachment.name.split('.').pop() || '';

    if (['jpeg', 'jpg', 'png'].includes(extension)) {
      return 'Sent a photo';
    } else {
      return 'Sent a file';
    }
  }

  return message.text || '';
};

const latestMessages = isAuthenticated
  .input(
    z.object({
      staffId: z.string().optional(),
      take: z.number().optional(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const userMessages = await prisma.message.findMany({
      where: {
        user: {
          organization_id: ctx.user.organization.id,
        },
        ...(input.staffId && {
          thread: {
            participantIds: {
              has: ctx.user.id,
            },
          },
        }),
      },
      distinct: ['thread_id'],
      take: input.take || 5,
      orderBy: {
        created_at: 'desc',
      },
      include: {
        attachment: true,
        user: true,
      },
    });

    return userMessages.map((message) => ({
      id: message.id,
      content: getMessageContent(message),
      createdAt: message.created_at,
      senderId: message.user.id,
      senderName: getUserFullName(message.user),
      threadId: message.thread_id,
    }));
  });

export default latestMessages;
