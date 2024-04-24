import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import prisma from 'src/libs/prisma';
import { PatientFeed } from '../../../types/patient';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';

const patientFeeds = isAuthenticated
  .input(
    z.object({
      query: z.string().optional(),
      id: z.string(),
      limit: z.number().min(5).max(1000),
      cursor: z.string().nullish(),
      dateFrom: z.date().optional().nullish(),
      dateTo: z.date().optional().nullish(),
      chartStatus: z.enum(['all', 'signed', 'unsigned']).optional().nullish(),
    })
  )
  .query(async ({ input }) => {
    const limit = input.limit ?? 50;
    const { cursor } = input;

    let filterDateFrom, filterDateTo;
    if (input.dateTo && input.dateFrom) {
      // if dateFrom is after dateTo, then dateTo is the query filter start date
      filterDateFrom = dayjs(input.dateFrom).isAfter(dayjs(input.dateTo))
        ? dayjs(input.dateTo).set('hour', 0).set('minute', 0).set('second', 0).toDate()
        : dayjs(input.dateFrom).set('hour', 0).set('minute', 0).set('second', 0).toDate();
      // if dateTo is before dateFrom, then dateFrom is the query filter end date
      filterDateTo = dayjs(input.dateTo).isBefore(dayjs(input.dateFrom))
        ? dayjs(input.dateFrom).set('hour', 23).set('minute', 59).set('second', 59).toDate()
        : dayjs(input.dateTo).set('hour', 23).set('minute', 59).set('second', 59).toDate();
    }

    const where: Prisma.NotificationWhereInput = {
      AND: [
        {
          OR: [
            {
              to_user_id: input.id,
            },
            {
              from_user_id: input.id,
            },
          ],
        },
        {
          OR: [
            {
              message_id: {
                isSet: false,
              },
            },
            {
              message_id: null,
            },
          ],
        },
      ],
      ...(input.query && {
        OR: [
          {
            Chart: {
              OR: [
                {
                  name: {
                    contains: input.query,
                  },
                },
                {
                  free_text: {
                    contains: input.query,
                  },
                },
                {
                  subjective_text: {
                    contains: input.query,
                  },
                },
                {
                  objective_text: {
                    contains: input.query,
                  },
                },
                {
                  assessment_text: {
                    contains: input.query,
                  },
                },
                {
                  plan_text: {
                    contains: input.query,
                  },
                },
              ],
            },
          },
          {
            Consultation: {
              Charts: {
                some: {
                  OR: [
                    {
                      name: {
                        contains: input.query,
                      },
                    },
                    {
                      free_text: {
                        contains: input.query,
                      },
                    },
                    {
                      subjective_text: {
                        contains: input.query,
                      },
                    },
                    {
                      objective_text: {
                        contains: input.query,
                      },
                    },
                    {
                      assessment_text: {
                        contains: input.query,
                      },
                    },
                    {
                      plan_text: {
                        contains: input.query,
                      },
                    },
                  ],
                },
              },
            },
          },
        ],
      }),
      ...(filterDateFrom &&
        filterDateTo && {
          OR: [
            {
              Chart: {
                created_at: {
                  gte: filterDateFrom,
                  lte: filterDateTo,
                },
              },
            },
            {
              Consultation: {
                Charts: {
                  some: {
                    created_at: {
                      gte: filterDateFrom,
                      lte: filterDateTo,
                    },
                  },
                },
              },
            },
          ],
        }),
      ...(input.chartStatus &&
        input.chartStatus === 'signed' && {
          OR: [
            {
              Chart: {
                NOT: {
                  OR: [
                    {
                      signed_by_id: null,
                    },
                    {
                      signed_by_id: {
                        isSet: false,
                      },
                    },
                  ],
                },
              },
            },
            {
              Consultation: {
                Charts: {
                  some: {
                    NOT: {
                      OR: [
                        {
                          signed_by_id: null,
                        },
                        {
                          signed_by_id: {
                            isSet: false,
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          ],
        }),
      ...(input.chartStatus &&
        input.chartStatus === 'unsigned' && {
          OR: [
            {
              Chart: {
                OR: [
                  {
                    signed_by_id: null,
                  },
                  {
                    signed_by_id: {
                      isSet: false,
                    },
                  },
                ],
              },
            },
            {
              Consultation: {
                Charts: {
                  some: {
                    OR: [
                      {
                        signed_by_id: null,
                      },
                      {
                        signed_by_id: {
                          isSet: false,
                        },
                      },
                    ],
                  },
                },
              },
            },
          ],
        }),
    };
    const totalRowCount = await prisma.notification.count({
      where,
    });

    const notifications: PatientFeed[] = await prisma.notification.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        File: true,
        SubFile: true,
        Consultation: {
          include: {
            service: true,
            invoice: true,
            Charts: {
              include: {
                signed_by: true,
                user: {
                  include: {
                    address: true,
                  },
                },
                created_by: true,
              },
            },
            staffs: true,
          },
        },
        from_user: true,
        to_user: true,
        Chart: {
          include: {
            signed_by: true,
            user: {
              include: {
                address: true,
              },
            },
            created_by: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      distinct: ['consultation_id', 'sub_file_id', 'file_id', 'chart_id'], // return only unique feeds
    });

    let nextCursor: typeof cursor | undefined = undefined;
    if (notifications.length > limit) {
      const nextItem = notifications.pop();
      nextCursor = nextItem!.id;
    }

    return {
      notifications,
      nextCursor,
      meta: {
        totalRowCount,
      },
    };
  });

export default patientFeeds;
