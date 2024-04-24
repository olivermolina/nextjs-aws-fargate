import z from 'zod';
import { createInvoice } from '../invoice/create-invoice';
import { publicProcedure } from '../../trpc';
import prisma from '../../../libs/prisma';
import { TRPCError } from '@trpc/server';

const payAppointment = publicProcedure
  .input(
    z.object({
      patientId: z.string(),
      serviceId: z.string(),
      staffId: z.string(),
    }),
  )
  .mutation(async ({ input }) => {

    const service = await prisma.service.findFirst({
      where: {
        id: input.serviceId,
      },
      include: {
        staffs: {
          include: {
            Staff: true,
          },
        },
      },
    });

    if (!service) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Service not found',
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: input.patientId,
      },
      include: {
        StripeUserPaymentMethods: {
          include: {
            stripe_payment_method: true,
          },
        },
        organization: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    // Create invoice and pay
    const invoiceInput = {
      title: service.name || undefined,
      patientId: user.id,
      staffIds: [input.staffId],
      issueDate: new Date(),
      dueDate: new Date(),
      description: service.description || '',
      invoiceItems: [
        {
          id: service.id,
          service: service,
          description: service.name || undefined,
          cost: service.price || 0,
          code: service.code || undefined,
        },
      ],
    };

    return await createInvoice(invoiceInput, user.organization.id, input.staffId, true, true);
  });

export default payAppointment;
