import { publicProcedure } from '../../trpc';
import z from 'zod';
import prisma from '../../../libs/prisma';
import { invoiceSelect } from './invoice-select';
import { Invoice } from '../../../types/invoice';
import { isOwnedByOrganization } from '../../../utils/is-owned-by-organization';
import { TRPCError } from '@trpc/server';

export const getInvoice = publicProcedure
  .input(
    z.object({
      id: z.string(),
      organization_id: z.string().optional().nullable(),
    })
  )
  .query(async ({ input }) => {
    const invoice = await prisma.invoice.findUnique({
      where: {
        id: input.id,
      },
      select: invoiceSelect,
    });

    if (!invoice) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Invoice not found',
      });
    }

    if (input.organization_id) {
      isOwnedByOrganization(input.organization_id, invoice.patient);
    }

    return invoice as Invoice;
  });
