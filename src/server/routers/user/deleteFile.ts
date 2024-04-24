import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import s3Client from 'src/libs/aws-s3';
import prisma from 'src/libs/prisma';
import { LogAction } from '@prisma/client';

const deleteFile = isAuthenticated
  .input(
    z.object({
      id: z.string(),
      isSubFile: z.boolean(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      let bucket = process.env.AWS_S3_BUCKET_NAME;
      let key = '';

      if (input.isSubFile) {
        const subFile = await prisma.subFile.findUniqueOrThrow({
          where: {
            id: input.id,
          },
        });
        bucket = subFile.s3_bucket;
        key = subFile.s3_key;
      } else {
        const file = await prisma.file.findUniqueOrThrow({
          where: {
            id: input.id,
          },
        });
        bucket = file.s3_bucket;
        key = file.s3_key;
      }

      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      // @ts-ignore
      const response = await s3Client.send(command);
      if (response.$metadata.httpStatusCode !== 204) {
        throw new Error('Could not delete file');
      }

      if (input.isSubFile) {
        const deletedSubFile = await prisma.subFile.delete({
          where: {
            id: input.id,
          },
          include: {
            file: true,
          },
        });

        await prisma.log.create({
          data: {
            user_id: deletedSubFile.file.user_id,
            text: `the file`,
            staff_id: ctx.user.id,
            action: LogAction.DELETE,
            file_id: deletedSubFile.id,
          },
        });

        return deletedSubFile;
      }

      const deletedFile = await prisma.file.delete({
        where: {
          id: input.id,
        },
      });

      await prisma.log.create({
        data: {
          user_id: deletedFile.user_id,
          text: `the file`,
          staff_id: ctx.user.id,
          action: LogAction.DELETE,
          file_id: deletedFile.id,
        },
      });

      return deletedFile;
    } catch (err) {
      console.error(err);
    }
  });

export default deleteFile;
