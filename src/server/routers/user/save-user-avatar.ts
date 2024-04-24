import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import prisma from 'src/libs/prisma';
import { FileSchema } from '../../../utils/zod-schemas/file-upload';
import { Upload } from '@aws-sdk/lib-storage';
import s3Client from '../../../libs/aws-s3';
import { TRPCError } from '@trpc/server';

const saveUserAvatar = isAuthenticated
  .input(
    z.object({
      id: z.string(),
      file: FileSchema,
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const extension = input.file.name.split('.').pop() || '';
    const buffer = Buffer.from(input.file.base64.replace(/^data:.+;base64,/, ''), 'base64');

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `${ctx.user.organization_id}/${input.id}/avatar.${extension}`,
      Body: buffer,
      ContentType: input.file.type,
    };

    const upload = await new Upload({
      client: s3Client,
      params,
    }).done();
    if (!upload.Key) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update the avatar.',
      });
    }
    return prisma.user.update({
      where: {
        id: input.id,
      },
      data: {
        avatar: upload.Key,
      },
    });
  });

export default saveUserAvatar;
