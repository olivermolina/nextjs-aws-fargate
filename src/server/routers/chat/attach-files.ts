import { isAuthenticated, UpdatedContext } from '../middleware/isAuthenticated';
import prisma from 'src/libs/prisma';
import { Upload } from '@aws-sdk/lib-storage';
import s3Client from 'src/libs/aws-s3';
import { FileInput, FileSchema } from 'src/utils/zod-schemas/file-upload';
import z from 'zod';
import { innerFunction as createMessage } from './create-message';
import { PrismaClient } from '@prisma/client';

const uploadAndCreateFile = async (
  file: FileInput,
  toUserId: string,
  trx: PrismaClient,
  ctx: UpdatedContext,
  threadId?: string,
) => {
  try {
    const buffer = Buffer.from(file.base64.replace(/^data:.+;base64,/, ''), 'base64');

    const extension = file.name.split('.').pop();
    const newFile = await trx.messageAttachment.create({
      data: {
        name: file.name,
        type: file.type,
        size: file.size,
        s3_key: '',
        s3_bucket: '',
      },
    });

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `${ctx.user.organization_id}/${ctx.user.id}/${newFile.id}.${extension}`,
      Body: buffer,
      ContentType: file.type,
    };

    const upload = await new Upload({
      client: s3Client,
      params,
    }).done();

    await trx.messageAttachment.update({
      where: {
        id: newFile.id,
      },
      data: {
        s3_key: upload.Key,
        s3_bucket: upload.Bucket,
      },
    });

    return await createMessage({
      threadId,
      body: '',
      toUserId: toUserId,
      attachmentId: newFile.id,
      context: ctx,
      contentType: extension,
      client: trx,
    });
  } catch (error) {
    console.error(error);
  }
};

const attachFiles = isAuthenticated
  .input(
    z.object({
      threadId: z.string().optional(),
      toUserId: z.string(),
      files: z.array(FileSchema),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    return prisma.$transaction(
      async (trx) => {
        let promises = [];
        for (const file of input.files) {
          promises.push(uploadAndCreateFile(file, input.toUserId, trx as PrismaClient, ctx, input.threadId));
        }

        return Promise.all(promises);
      },
      {
        maxWait: 15000, // default: 2000
        timeout: 15000, // default: 5000
      },
    );
  });

export default attachFiles;
