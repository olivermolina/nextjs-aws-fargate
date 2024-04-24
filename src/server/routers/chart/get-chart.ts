import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import { TRPCError } from '@trpc/server';
import { isOwnedByOrganization } from '../../../utils/is-owned-by-organization';
import { getS3SignedUrlByKey } from '../../../utils/get-s3-signed-url-by-key';

export const innerFunction = async (id: string, organizationId: string) => {
  const chart = await prisma.chart.findFirst({
    where: {
      id,
    },
    include: {
      signed_by: true,
      user: {
        include: {
          address: true,
        },
      },
      created_by: true,
      items: {
        include: {
          ChartNote: true,
          ChiefComplaint: true,
          ChartNoteEditor: true,
          ChartSketch: true,
          ChartHeading: true,
          ChartSpine: true,
          BodyChart: true,
          ChartFile: true,
          ChartDropdown: true,
          ChartRange: true,
          ChartCheckBox: true,
          Vital: true,
          Allergy: true,
          Problem: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
  });

  if (!chart) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Chart not found',
    });
  }

  isOwnedByOrganization(organizationId, chart.user);

  if (chart.items) {
    chart.items = await Promise.all(
      chart.items.map(async (item) => ({
        ...item,
        ...(item.ChartSketch && {
          ChartSketch: {
            ...item.ChartSketch,
            signedUrl: await getS3SignedUrlByKey(item.ChartSketch.background_s3_key, true),
          },
        }),
        ...(item.BodyChart && {
          BodyChart: {
            ...item.BodyChart,
            signedUrl: await getS3SignedUrlByKey(item.BodyChart.background_s3_key, true),
          },
        }),
        ...(item.ChartFile && {
          ChartFile: {
            ...item.ChartFile,
            signedUrl: await getS3SignedUrlByKey(item.ChartFile.file_s3_key, true),
          },
        }),
      })),
    );
  }

  await Promise.all(
    chart.items.map((item, index) =>
      prisma.chartItem.update({
        where: {
          id: item.id,
        },
        data: {
          order: index + 1,
        },
      }),
    ),
  );

  chart.items = chart.items.map((item, index) => ({ ...item, order: index + 1 }));
  return chart;
};

const getChart = isAuthenticated
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(async ({ input, ctx }) => {
    return innerFunction(input.id, ctx.user.organization_id);
  });

export default getChart;
