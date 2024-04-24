import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import prisma from 'src/libs/prisma';
import s3Client from '../../../libs/aws-s3';
import { TRPCError } from '@trpc/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getUserFullName } from '../../../utils/get-user-full-name';
import { getInitials } from '../../../utils/get-initials';

const getUserAvatar = isAuthenticated
  .input(
    z.object({
      id: z.string(),
    })
  )
  .query(async ({ input }) => {
    if (!input.id) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'User id is required.',
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: input.id,
      },
    });

    const fullName = getUserFullName(user);
    const initials = getInitials(fullName);

    if (!user) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'User not found.',
      });
    }

    if (!user.avatar) {
      return {
        full_name: fullName,
        initials,
        url: undefined,
      };
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: user.avatar,
    });

    try {
      // @ts-ignore
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      return {
        full_name: fullName,
        initials,
        url: signedUrl || undefined,
      };
    } catch (e) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get the avatar.',
      });
    }
  });

export default getUserAvatar;
