import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import { Prisma, Status } from '@prisma/client';
import prisma from 'src/libs/prisma';
import { ConsultationSelect, ConsultationTrpcResponse } from './index';

export const consultationList = isAuthenticated
  .input(
    z.object({
      userId: z.string().optional().nullable(),
      status: z.nativeEnum(Status).optional(),
      query: z.string().optional(),
      rowsPerPage: z.number().min(5).max(1000),
      page: z.number().min(0),
      from: z.string().optional(),
      to: z.string().optional(),
      staff_ids: z.array(z.string()).optional(),
      sortDir: z.nativeEnum(Prisma.SortOrder).optional(),
      service_ids: z.array(z.string()).optional(),
      staffId: z.string().optional(),
      id: z.string().optional().nullable(),
      location_ids: z.array(z.string()).optional(),
      telemedicine: z.boolean().optional(),
    })
  )

  .query(async ({ input, ctx }) => {
    const where: Prisma.ConsultationWhereInput = {
      ...(input.status && { status: input.status }),
      ...(input.query && {
        user: {
          OR: [
            {
              first_name: {
                contains: input.query,
                mode: 'insensitive',
              },
            },
            {
              last_name: {
                contains: input.query,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: input.query,
                mode: 'insensitive',
              },
            },
          ],
        },
      }),
      ...(input.userId && {
        user_id: input.userId,
      }),
      ...(input.from && {
        start_time: {
          gte: new Date(input.from),
        },
      }),
      ...(input.to && {
        end_time: {
          lte: new Date(input.to),
        },
      }),
      ...(input.staff_ids && {
        staffs: {
          some: {
            staff: {
              id: {
                in: input.staff_ids,
              },
            },
          },
        },
      }),
      ...(input.service_ids && {
        service_id: {
          in: input.service_ids,
        },
      }),
      user: {
        organization_id: ctx.user.organization_id,
      },
      ...(input.id && {
        id: input.id,
      }),
      ...(input.telemedicine &&
        input.location_ids &&
        input.location_ids.length > 0 && {
          OR: [
            {
              telemedicine: input.telemedicine,
            },
            {
              location_id: {
                in: input.location_ids,
              },
            },
          ],
        }),
      ...(!input.telemedicine &&
        input.location_ids &&
        input.location_ids.length > 0 && {
          location_id: {
            in: input.location_ids,
          },
        }),
      ...(input.telemedicine &&
        (!input.location_ids || input.location_ids.length === 0) && {
          telemedicine: input.telemedicine,
        }),
    };

    const totalRowCount = await prisma.consultation.count({
      where,
    });

    const consultations = await prisma.consultation.findMany({
      skip: input.page * input.rowsPerPage,
      take: input.rowsPerPage,
      where,
      ...(input.sortDir && {
        orderBy: {
          start_time: input.sortDir,
        },
      }),
      select: ConsultationSelect,
    });

    return {
      items: consultations as ConsultationTrpcResponse[],
      meta: {
        totalRowCount,
      },
    };
  });
