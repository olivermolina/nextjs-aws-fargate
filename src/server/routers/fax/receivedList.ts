import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import { getClient } from 'srfax-node';
import { TRPCError } from '@trpc/server';
import dayjs from 'dayjs';
import prisma from '../../../libs/prisma';
import { decode } from '../../../utils/jwt';
import { SrFaxInput } from '../../../utils/zod-schemas/srfax';

type ReceivedFax = {
  FileName: string;
  ReceiveStatus: string;
  Date: string;
  EpochTime: string;
  CallerID: string;
  RemoteID: string;
  Pages: number;
  Size: number;
};

const receivedList = isAuthenticated
  .input(
    z.object({
      from: z.date(),
      to: z.date(),
    })
  )
  .query(async ({ input, ctx }) => {
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

    try {
      const client = getClient();
      const args = {
        access_id: Number(account_number),
        access_pwd: access_password,
        sResponseFormat: 'JSON',
        action: 'Get_Fax_Inbox',
        sPeriod: 'RANGE',
        sStartDate: dayjs(input.from).format('YYYYMMDD'),
        sEndDate: dayjs(input.to).format('YYYYMMDD'),
      };
      const { data } = await client.post('', args);

      if (data?.Status === 'Success') {
        return data?.Result as ReceivedFax[];
      }

      return null;
    } catch (e) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch received faxes.',
      });
    }
  });

export default receivedList;
