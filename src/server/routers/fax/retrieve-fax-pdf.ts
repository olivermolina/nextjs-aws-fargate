import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import { getClient } from 'srfax-node';
import { TRPCError } from '@trpc/server';
import prisma from '../../../libs/prisma';
import { decode } from '../../../utils/jwt';
import { SrFaxInput } from '../../../utils/zod-schemas/srfax';

const retrieveFaxPdf = isAuthenticated
  .input(
    z.object({
      sFaxDetailsID: z.string(),
      sDirection: z.enum(['IN', 'OUT']),
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
        action: 'Retrieve_Fax',
        sFaxDetailsID: input.sFaxDetailsID,
        sDirection: input.sDirection,
        sFaxFormat: 'PDF',
      };
      const { data } = await client.post('', args);
      return data?.Result;
    } catch (e) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch fax.',
      });
    }
  });

export default retrieveFaxPdf;
