import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { addNotification } from '../notification/addNotification';
import { AllergyStatus, ChartItemType, LogAction, Prisma, ProblemStatus } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { CreateItemChartSchema } from '../../../utils/zod-schemas/chart';
import {
  mapHeightCountryUnit,
  mapTemperatureCountryUnit,
  mapWeightCountryUnit,
} from '../../../utils/vitals-utils';

const createChartItem = isAuthenticated
  .input(CreateItemChartSchema)
  .mutation(async ({ input, ctx }) => {
    let chart;
    if (!input.chartId) {
      try {
        chart = await prisma.chart.create({
          data: {
            name: 'Charting note',
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
            ...(input.consultationId && {
              consultation: {
                connect: {
                  id: input.consultationId,
                },
              },
            }),
            service_datetime: input.service_datetime,
          },
          include: {
            items: true,
          },
        });
      } catch (e) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error creating charting note',
        });
      }

      // If consultationId is not provided, create notification
      if (!input.consultationId) {
        await addNotification({
          organizationId: ctx.user.organization_id,
          toUserIds: [input.userId],
          notificationsCreateManyInput: {
            from_user_id: ctx.user.id,
            description: 'added a charting note',
            chart_id: chart.id,
          },
        });
      }

      await prisma.log.create({
        data: {
          user_id: input.userId,
          text: `the chart ${chart.name}`,
          staff_id: ctx.user.id,
          chart_id: chart.id,
          action: LogAction.CREATE,
        },
      });
    } else {
      chart = await prisma.chart.findUnique({
        where: {
          id: input.chartId,
        },
        include: {
          items: true,
        },
      });
    }

    if (!chart) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Chart not found',
      });
    }

    let chartItemData: Prisma.ChartItemCreateInput = {
      type: input.itemType,
      chart: {
        connect: {
          id: chart.id,
        },
      },
      order: input.order || 1,
    };
    switch (input.itemType) {
      case ChartItemType.CHIEF_COMPLAINT:
        chartItemData.ChiefComplaint = {
          create: {
            value: '',
          },
        };
        break;
      case ChartItemType.NOTE:
        chartItemData.ChartNote = {
          create: {
            label: 'Note',
          },
        };
        break;
      case ChartItemType.NOTE_EDITOR:
        chartItemData.ChartNoteEditor = {
          create: {
            label: 'Note Editor',
          },
        };
        break;
      case ChartItemType.BODY_CHART:
        chartItemData.BodyChart = {
          create: {
            label: 'Body Chart',
            canvas: '',
            points: [] as Prisma.JsonArray,
          },
        };
        break;
      case ChartItemType.SKETCH:
        chartItemData.ChartSketch = {
          create: {
            canvas: '',
            label: 'Sketch',
          },
        };
        break;
      case ChartItemType.FILE:
        chartItemData.ChartFile = {
          create: {
            label: 'Upload',
            file_s3_key: '',
            file_description: '',
            file_name: '',
          },
        };
        break;
      case ChartItemType.SPINE:
        chartItemData.ChartSpine = {
          create: {
            notes: '',
            label: 'Spine',
            value: [] as Prisma.JsonArray,
          },
        };
        break;
      case ChartItemType.HEADING:
        chartItemData.ChartHeading = {
          create: {
            value: 'Heading',
          },
        };
        break;
      case ChartItemType.CHECKBOXES:
        chartItemData.ChartCheckBox = {
          create: {
            label: 'Check Boxes',
            layout: 'horizontal',
            value: [],
            options: ['1', '2', '3', '4', '5'],
            include_note: false,
            hide_unchecked_after_signing: false,
            required: false,
          },
        };
        break;
      case ChartItemType.DROPDOWN:
        chartItemData.ChartDropdown = {
          create: {
            label: 'Drop Down',
            prompt: 'Select an option...',
            options: ['1', '2', '3', '4', '5'],
          },
        };
        break;
      case ChartItemType.RANGE:
        chartItemData.ChartRange = {
          create: {
            label: 'Range / Scale',
            default_value: '5',
            options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
          },
        };
        break;
      case ChartItemType.VITALS:
        const organization = await prisma.organization.findUnique({
          where: {
            id: ctx.user.organization_id,
          },
          include: {
            address: true,
          },
        });
        const country = organization?.address?.country;
        chartItemData.Vital = {
          create: {
            user_id: input.userId,
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
            user_id: input.userId,
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
            user_id: input.userId,
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

    try {
      // Create chart item
      const newChartItem = await prisma.chartItem.create({
        data: chartItemData,
      });

      const items = Array.isArray(chart.items) ? chart.items : [];
      const itemIndex =
        input.order === undefined || input.order === null ? chart.items.length : input.order + 1;
      items.splice(itemIndex, 0, newChartItem);
      const newItems = items.map((item, index) => ({ ...item, order: index + 1 }));
      // Update chart items order
      prisma.$transaction([
        ...newItems.map((item) =>
          prisma.chartItem.update({
            where: { id: item.id },
            data: { order: item.order },
          })
        ),
      ]);

      return newItems.find((item) => item.id === newChartItem.id);
    } catch (e) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error creating charting note',
      });
    }
  });
export default createChartItem;
