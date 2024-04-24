import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import { FileSchema } from '../../../utils/zod-schemas/file-upload';
import { getS3SignedUrlByKey } from '../../../utils/get-s3-signed-url-by-key';
import { BodyChart, ChartItemType, Prisma } from '@prisma/client';
import { chartUploadS3File } from './save-sketch';

const saveBodyChart = isAuthenticated
  .input(
    z.object({
      id: z.string(),
      canvas: z.string().optional().nullable(),
      image: FileSchema.optional().nullable(),
      label: z.string().optional().nullable(),
      points: z
        .array(
          z.object({
            id: z.string(),
            x: z.number(),
            y: z.number(),
            notes: z.string().optional().nullable(),
          })
        )
        .optional()
        .nullable(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    let background_s3_key = undefined;

    if (input.image?.base64 === '/assets/body-chart.png') {
      background_s3_key = null;
    }

    if (input.image && input.image.base64 !== '/assets/body-chart.png') {
      background_s3_key = await chartUploadS3File(
        input.image,
        ctx.user.organization_id,
        input.id,
        ChartItemType.BODY_CHART,
      );
    }

    const bodyChart = await prisma.bodyChart.update({
      where: {
        id: input.id,
      },
      data: {
        ...(input.label && { label: input.label }),
        ...(input.canvas && { canvas: input.canvas }),
        ...(background_s3_key !== undefined && { background_s3_key }),
        ...(input.points && { points: input.points as Prisma.JsonArray }),
      },
    });

    let signedUrl = null;
    if (background_s3_key) {
      signedUrl = await getS3SignedUrlByKey(bodyChart.background_s3_key, true);
    }

    return {
      ...bodyChart,
      signedUrl,
    } as BodyChart & { signedUrl?: string | null };
  });
export default saveBodyChart;
