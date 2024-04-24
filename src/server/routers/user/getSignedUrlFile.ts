import z from 'zod';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import s3Client from 'src/libs/aws-s3';
import prisma from 'src/libs/prisma';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { TRPCError } from '@trpc/server';
import axios from 'axios';
import { publicProcedure } from '../../trpc';

export async function urlToBase64(url: string) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data, 'binary');
  return buffer.toString('base64');
}

const getSignedUrlFile = publicProcedure
  .input(
    z.object({
      id: z.string().optional(),
      key: z.string().optional(),
      isSubFiles: z.boolean().optional(),
      base64: z.boolean().optional(),
    })
  )
  .query(async ({ input }) => {
    try {
      let fileKey = input.key || '';
      let bucket = '';
      if (input.id && !input.isSubFiles) {
        const file = await prisma.file.findUniqueOrThrow({
          where: {
            id: input.id,
          },
        });

        fileKey = file.s3_key;
        bucket = file.s3_bucket;
      }

      if (input.id && input.isSubFiles) {
        const file = await prisma.subFile.findUniqueOrThrow({
          where: {
            id: input.id,
          },
        });

        fileKey = file.s3_key;
        bucket = file.s3_bucket;
      }

      if (!fileKey) throw new Error('File not found');

      const command = new GetObjectCommand({
        Bucket: bucket || process.env.AWS_S3_BUCKET_NAME,
        Key: fileKey,
      });

      // @ts-ignore
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

      if (input.base64) {
        return await urlToBase64(signedUrl);
      }

      return signedUrl;
    } catch (err) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: err.message,
      });
    }
  });

export default getSignedUrlFile;
