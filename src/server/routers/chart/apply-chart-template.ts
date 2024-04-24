import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import { innerFunction, innerFunction as getChart } from './get-chart';
import { TRPCError } from '@trpc/server';
import {
  AllergyStatus,
  Chart,
  ChartItem,
  ChartItemType,
  Prisma,
  ProblemStatus,
} from '@prisma/client';
import {
  mapHeightCountryUnit,
  mapTemperatureCountryUnit,
  mapWeightCountryUnit,
} from '../../../utils/vitals-utils';

type ChartTemplateItem = Awaited<ReturnType<typeof getChart>>['items'][0];

const addChartItem = async ({
                              userId,
                              chartId,
                              organizationId,
                              chartTemplateItem,
                              order,
                            }: {
  userId: string;
  chartId: string;
  organizationId: string;
  chartTemplateItem: ChartTemplateItem;
  order: number;
}) => {
  let chartItemData: Prisma.ChartItemCreateInput = {
    type: chartTemplateItem.type as ChartItemType,
    chart: {
      connect: {
        id: chartId,
      },
    },
    order,
  };
  switch (chartTemplateItem.type as ChartItemType) {
    case ChartItemType.CHIEF_COMPLAINT:
      chartItemData.ChiefComplaint = {
        create: {
          value: chartTemplateItem.ChiefComplaint?.value || '',
        },
      };
      break;
    case ChartItemType.NOTE:
      chartItemData.ChartNote = {
        create: {
          label: chartTemplateItem.ChartNote?.label || 'Note',
        },
      };
      break;
    case ChartItemType.NOTE_EDITOR:
      chartItemData.ChartNoteEditor = {
        create: {
          label: chartTemplateItem.ChartNoteEditor?.label || 'Note Editor',
        },
      };
      break;
    case ChartItemType.BODY_CHART:
      chartItemData.BodyChart = {
        create: {
          label: chartTemplateItem.BodyChart?.label || 'Body Chart',
          canvas: chartTemplateItem.BodyChart?.canvas || '',
          points: chartTemplateItem.BodyChart?.points || ([] as Prisma.JsonArray),
        },
      };
      break;
    case ChartItemType.SKETCH:
      chartItemData.ChartSketch = {
        create: {
          canvas: chartTemplateItem.ChartSketch?.canvas || '',
          label: chartTemplateItem.ChartSketch?.label || 'Sketch',
        },
      };
      break;
    case ChartItemType.FILE:
      chartItemData.ChartFile = {
        create: {
          label: chartTemplateItem.ChartFile?.label || 'Upload',
          file_s3_key: chartTemplateItem.ChartFile?.file_s3_key || '',
          file_description: chartTemplateItem.ChartFile?.file_description || '',
          file_name: chartTemplateItem.ChartFile?.file_name || '',
        },
      };
      break;
    case ChartItemType.SPINE:
      chartItemData.ChartSpine = {
        create: {
          notes: chartTemplateItem.ChartSpine?.notes || '',
          label: chartTemplateItem.ChartSpine?.label || 'Spine',
          value: chartTemplateItem.ChartSpine?.value || ([] as Prisma.JsonArray),
        },
      };
      break;
    case ChartItemType.HEADING:
      chartItemData.ChartHeading = {
        create: {
          value: chartTemplateItem.ChartHeading?.value || 'Heading',
        },
      };
      break;
    case ChartItemType.CHECKBOXES:
      chartItemData.ChartCheckBox = {
        create: {
          label: chartTemplateItem.ChartCheckBox?.label || 'Check Boxes',
          layout: chartTemplateItem.ChartCheckBox?.layout || 'horizontal',
          value: chartTemplateItem.ChartCheckBox?.value || [],
          options: chartTemplateItem.ChartCheckBox?.options || ['1', '2', '3', '4', '5'],
          include_note: chartTemplateItem.ChartCheckBox?.include_note || false,
          hide_unchecked_after_signing:
            chartTemplateItem.ChartCheckBox?.hide_unchecked_after_signing || false,
          required: chartTemplateItem.ChartCheckBox?.required || false,
        },
      };
      break;
    case ChartItemType.DROPDOWN:
      chartItemData.ChartDropdown = {
        create: {
          label: chartTemplateItem.ChartDropdown?.label || 'Drop Down',
          prompt: chartTemplateItem.ChartDropdown?.prompt || 'Select an option...',
          options: chartTemplateItem.ChartDropdown?.options || ['1', '2', '3', '4', '5'],
        },
      };
      break;
    case ChartItemType.RANGE:
      chartItemData.ChartRange = {
        create: {
          label: chartTemplateItem.ChartRange?.label || 'Range / Scale',
          default_value: chartTemplateItem.ChartRange?.default_value || '5',
          options: chartTemplateItem.ChartRange?.options || [
            '0',
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            '10',
          ],
        },
      };
      break;
    case ChartItemType.VITALS:
      const organization = await prisma.organization.findUnique({
        where: {
          id: organizationId,
        },
        include: {
          address: true,
        },
      });
      const country = organization?.address?.country;
      chartItemData.Vital = {
        create: {
          user_id: userId,
          date: new Date(),
          height_unit: mapHeightCountryUnit(country),
          weight_unit: mapWeightCountryUnit(country),
          temperature_unit: mapTemperatureCountryUnit(country),
          bmi: 0,
          height: 0,
          weight: 0,
          temperature: 0,
          systolic: 0,
          diastolic: 0,
          respiratory_rate: 0,
          heart_rate: 0,
          oxygen_saturation: 0,
        },
      };
      break;
    case ChartItemType.ALLERGY:
      chartItemData.Allergy = {
        create: {
          user_id: userId,
          name: '',
          reaction: '',
          onset_date: new Date(),
          status: AllergyStatus.ACTIVE,
        },
      };
      break;
    case ChartItemType.PROBLEM:
      chartItemData.Problem = {
        create: {
          user_id: userId,
          title: '',
          synopsis: '',
          code: [],
          diagnostic_date: new Date(),
          status: ProblemStatus.ACTIVE,
        },
      };
      break;
    default:
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Item type not found',
      });
  }

  // Create chart item
  return prisma.chartItem.create({
    data: chartItemData,
  });
};

const applyChartTemplate = isAuthenticated
  .input(
    z.object({
      userId: z.string(),
      chartId: z.string().optional(),
      templateId: z.string(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const chartTemplate = await prisma.chartTemplate.findUnique({
      where: {
        id: input.templateId,
      },
    });

    if (!chartTemplate) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Chart template not found. Please try again.',
      });
    }

    const items = (chartTemplate.items as Prisma.JsonArray as unknown as ChartTemplateItem[]) || [];

    let chart:
      | (Chart & {
      items: ChartItem[];
    })
      | null = null;
    if (input.chartId) {
      chart = await prisma.chart.findUnique({
        where: {
          id: input.chartId,
        },
        include: {
          items: true,
        },
      });
    } else {
      chart = await prisma.chart.create({
        data: {
          name: chartTemplate.title,
          user: {
            connect: {
              id: input.userId,
            },
          },
          created_by: {
            connect: {
              id: ctx.user.id,
            },
          },
          assigned_to: {
            connect: {
              id: ctx.user.id,
            },
          },
          service_datetime: new Date(),
        },
        include: {
          items: true,
        },
      });
    }

    if (!chart) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Chart not found. Please try again.',
      });
    }

    const oldItems = chart.items || [];

    await Promise.all(
      items.map(
        async (item, index) =>
          await addChartItem({
            userId: input.userId,
            chartId: chart?.id || '',
            organizationId: ctx.user.organization_id,
            chartTemplateItem: item,
            order: oldItems.length + index + 1,
          }),
      ),
    );

    return innerFunction(chart.id, ctx.user.organization_id);
  });
export default applyChartTemplate;
