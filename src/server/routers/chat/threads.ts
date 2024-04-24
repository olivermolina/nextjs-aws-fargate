import { isAuthenticated } from '../middleware/isAuthenticated';
import prisma from '../../../libs/prisma';
import { getUserFullName } from '../../../utils/get-user-full-name';
import { Attachment, Message, Participant, Thread } from '../../../types/chat';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client from '../../../libs/aws-s3';
import {
  Message as PrismaMessage,
  MessageAttachment as PrismaAttachment,
  Thread as PrismaThread,
} from '@prisma/client';

type FormatMessageType = PrismaMessage & {
  attachment: PrismaAttachment | null;
};

export const formatMessage = async (message: FormatMessageType) => {
  const { id, attachment, text, contentType, created_at, user_id } = message;
  let attachments: Attachment[] = [];
  let body = text;
  if (attachment) {
    const command = new GetObjectCommand({
      Bucket: attachment.s3_bucket || process.env.AWS_S3_BUCKET_NAME,
      Key: attachment.s3_key,
    });

    // @ts-ignore
    const url = await getSignedUrl(s3Client, command, { expiresIn: 86400 });
    attachments = [
      {
        id: attachment.id,
        url,
        name: attachment.name,
      },
    ];
    body = url;
  }
  return {
    id,
    attachments,
    body,
    contentType,
    createdAt: created_at.getTime(),
    authorId: user_id,
    threadId: message.thread_id,
  } as Message;
};

type FormatThreadType = PrismaThread & {
  messages: (PrismaMessage & {
    attachment: PrismaAttachment | null;
  })[];
};

export const formatThread = async (thread: FormatThreadType) => {
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: thread.participantIds,
      },
    },
  });

  const formattedMessages = await Promise.all(thread.messages.map(formatMessage));

  const participants = users.map(
    (user) =>
      ({
        ...user,
        name: getUserFullName(user),
      }) as Participant,
  );

  return {
    id: thread.id,
    title: thread.title,
    messages: formattedMessages,
    participantIds: thread.participantIds,
    participants,
    unreadCount: thread.unreadCount,
  } as Thread;
};

const threads = isAuthenticated.query(async ({ ctx }) => {
  const threads = await prisma.thread.findMany({
    where: {
      participantIds: {
        has: ctx.user.id,
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

  const formattedThreads: Thread[] = await Promise.all(threads.map(formatThread));

  return formattedThreads;
});

export default threads;
