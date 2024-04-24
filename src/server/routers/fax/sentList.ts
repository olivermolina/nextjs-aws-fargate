import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import { Prisma } from '@prisma/client';
import { getClient } from 'srfax-node';
import { ISentFax } from '../../../types/sr-fax';
import dayjs from 'dayjs';
import { TRPCError } from '@trpc/server';
import { decode } from '../../../utils/jwt';
import { SrFaxInput } from '../../../utils/zod-schemas/srfax';

const sentList = isAuthenticated
  .input(
    z.object({
      query: z.string().optional(),
      rowsPerPage: z.number().min(5).max(1000),
      page: z.number().min(0),
      sortDir: z.nativeEnum(Prisma.SortOrder),
    })
  )
  .query(async ({ input, ctx }) => {
    const where: Prisma.FaxWhereInput = {
      ...(input.query && {
        OR: [
          {
            staff: {
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
          },
          {
            status_message: {
              contains: input.query,
              mode: 'insensitive',
            },
          },
          {
            to_number: {
              contains: input.query,
              mode: 'insensitive',
            },
          },
          {
            subject: {
              contains: input.query,
              mode: 'insensitive',
            },
          },
          {
            remarks: {
              contains: input.query,
              mode: 'insensitive',
            },
          },
          {
            recipient_first_name: {
              contains: input.query,
              mode: 'insensitive',
            },
          },
          {
            recipient_last_name: {
              contains: input.query,
              mode: 'insensitive',
            },
          },
          {
            recipient_business_name: {
              contains: input.query,
              mode: 'insensitive',
            },
          },
          {
            srfax_sent_status: {
              contains: input.query,
              mode: 'insensitive',
            },
          },
          {
            srfax_error_code: {
              contains: input.query,
              mode: 'insensitive',
            },
          },
        ],
      }),
    };

    const totalRowCount = await prisma.fax.count({
      where,
    });

    const items = await prisma.fax.findMany({
      skip: input.page * input.rowsPerPage,
      take: input.rowsPerPage,
      where,
      orderBy: {
        updated_at: input.sortDir,
      },
      include: {
        staff: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    try {
      //Get the start date and end date from items
      const startDate = items[0].created_at;
      const endDate = items[items.length - 1].created_at;

      const srFaxSettings = await prisma.sRFaxSettings.findUnique({
        where: {
          organization_id: ctx.user.organization_id,
        },
      });

      if (!srFaxSettings) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'SRFax service is not configured. Please contact support.',
        });
      }

      const { account_number, access_password } = decode(srFaxSettings.access_token) as Pick<
        SrFaxInput,
        'account_number' | 'access_password'
      >;

      const client = getClient();
      const { data } = await client.post('', {
        access_id: Number(account_number),
        access_pwd: access_password,
        sResponseFormat: 'JSON',
        action: 'Get_Fax_Outbox',
        sPeriod: 'RANGE',
        sStartDate: dayjs(startDate).subtract(1, 'day').format('YYYYMMDD'),
        sEndDate: dayjs(endDate).add(1, 'day').format('YYYYMMDD'),
      });
      if (data.Status === 'Success') {
        const srFaxes = data.Result as ISentFax[];

        // Update the faxes in the database
        await Promise.all(
          srFaxes.map(async (fax) => {
            const faxRecord = items.find((item) => item.account_code === fax.AccountCode);
            if (faxRecord) {
              await prisma.fax.update({
                where: {
                  id: faxRecord.id,
                },
                data: {
                  srfax_file_name: fax.FileName,
                  srfax_sent_status: fax.SentStatus,
                  srfax_error_code: fax.ErrorCode,
                  srfax_size: Number(fax.Size),
                  srfax_pages: Number(fax.Pages),
                },
              });
            }
          })
        );

        // Update the status of the faxes
        items.forEach((item) => {
          const fax = srFaxes.find((fax) => fax.AccountCode === item.account_code);
          if (fax) {
            item.srfax_file_name = fax.FileName;
            item.srfax_sent_status = fax.SentStatus;
            item.srfax_error_code = fax.ErrorCode;
            item.srfax_size = fax.Size;
            item.srfax_pages = fax.Pages;
          }
        });
      }
    } catch (e) {
      console.log(e);
    }

    return {
      items,
      meta: {
        totalRowCount,
      },
    };
  });

export default sentList;
