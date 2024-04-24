import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client from '../libs/aws-s3';
import { TRPCError } from '@trpc/server';

export const getS3SignedUrlByKey = async (key?: string | null, ignoreErrors?: boolean) => {
  if (!key) {
    if (ignoreErrors) {
      return null;
    }
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Key is required.',
    });
  }

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  });

  try {
    // @ts-ignore
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } catch (e) {
    if (ignoreErrors) {
      return null;
    }
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to get the signed url.',
    });
  }
};
