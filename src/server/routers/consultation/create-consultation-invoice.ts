import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import prisma from 'src/libs/prisma';
import { TRPCError } from '@trpc/server';
import { ConsultationSelect, ConsultationTrpcResponse } from './index';
import { createInvoice } from '../invoice/create-invoice';

export const createConsultationInvoice = async (consultation: ConsultationTrpcResponse) => {
  const organization = consultation.user.organization;
  const staffIds = consultation.staffs?.map((staff) => staff.staff_id);
  const service = consultation.service;
  const input = {
    title: consultation.title || undefined,
    patientId: consultation.user_id,
    staffIds: staffIds,
    issueDate: new Date(),
    dueDate: new Date(),
    description: consultation.description,
    invoiceItems: service
      ? [
        {
          id: service.id,
          service: service,
          description: service.name || undefined,
          cost: service.price || 0,
          code: service.code || undefined,
        },
      ]
      : [],
  };
  const invoice = await createInvoice(input, organization.id, staffIds[0]);

  await prisma.consultation.update({
    where: {
      id: consultation.id,
    },
    data: {
      invoice_id: invoice.id,
    },
  });

  return invoice;
};

export default isAuthenticated
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    const consultation = await prisma.consultation.findUnique({
      where: {
        id: input.id,
      },
      select: ConsultationSelect,
    });

    if (!consultation) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Consultation not found',
      });
    }

    return await createConsultationInvoice(consultation as ConsultationTrpcResponse);
  });
