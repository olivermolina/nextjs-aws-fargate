import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import { FileInput, FileSchema } from '../../../utils/zod-schemas/file-upload';
import { Upload } from '@aws-sdk/lib-storage';
import s3Client from '../../../libs/aws-s3';
import { getS3SignedUrlByKey } from '../../../utils/get-s3-signed-url-by-key';
import { ChartItemType, ChartSketch } from '@prisma/client';

export const chartUploadS3File = async (
  file: FileInput,
  organizationId: string,
  id: string,
  itemType: ChartItemType,
) => {
  try {
    const buffer = Buffer.from(file.base64.replace(/^data:.+;base64,/, ''), 'base64');

    const extension = file.name.split('.').pop();

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `${organizationId}/chart-uploads/${itemType.toLowerCase()}/${id}.${extension}`,
      Body: buffer,
      ContentType: file.type,
    };
    const result = await new Upload({
      client: s3Client,
      params,
    }).done();
    return result.Key || '';
  } catch (error) {
    console.error(error);

    return '';
  }
};

const saveSketch = isAuthenticated
  .input(
    z.object({
      id: z.string(),
      canvas: z.string().optional().nullable(),
      image: FileSchema.optional().nullable(),
      label: z.string().optional().nullable(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    let background_s3_key = undefined;

    if (input.image?.base64 === '/assets/sketch-bg.png') {
      background_s3_key = null;
    }

    if (input.image && input.image.base64 !== '/assets/sketch-bg.png') {
      background_s3_key = await chartUploadS3File(
        input.image,
        ctx.user.organization_id,
        input.id,
        ChartItemType.SKETCH,
      );
    }

    const sketch = await prisma.chartSketch.update({
      where: {
        id: input.id,
      },
      data: {
        ...(input.label && { label: input.label }),
        ...(input.canvas && { canvas: input.canvas }),
        ...(background_s3_key !== undefined && { background_s3_key }),
      },
    });

    let signedUrl = null;
    if (background_s3_key) {
      signedUrl = await getS3SignedUrlByKey(sketch.background_s3_key, true);
    }

    return {
      ...sketch,
      signedUrl,
    } as ChartSketch & { signedUrl?: string | null };
  });
export default saveSketch;
