import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import { FileSchema } from '../../../utils/zod-schemas/file-upload';
import { chartUploadS3File } from './save-sketch';
import { ChartItemType } from '@prisma/client';

const saveFile = isAuthenticated
  .input(
    z.object({
      id: z.string(),
      label: z.string().optional().nullable(),
      file_description: z.string().optional().nullable(),
      file: FileSchema.optional().nullable(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    let file_s3_key = '',
      file_name = '',
      file_type = '';

    if (input.file && input.file.name !== '') {
      file_s3_key = await chartUploadS3File(
        input.file,
        ctx.user.organization_id,
        input.id,
        ChartItemType.FILE,
      );
      file_name = input.file.name;
      file_type = input.file.type;
    }

    return prisma.chartFile.update({
      where: {
        id: input.id,
      },
      data: {
        ...(input.label && { label: input.label }),
        ...(input.file_description && { file_description: input.file_description }),
        ...(input.file && { file_s3_key, file_name, file_type }),
      },
    });
  });
export default saveFile;
