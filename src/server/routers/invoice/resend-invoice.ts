import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import prisma from '../../../libs/prisma';
import { invoiceSelect } from './invoice-select';
import { Invoice } from '../../../types/invoice';
import { patientInvoice } from '../../../utils/send-mail/patient-invoice';
import { InvoiceStatus } from '@prisma/client';
import { patientPaymentReceipt } from '../../../utils/send-mail';

export const resendInvoice = isAuthenticated.input(
  z.object({
    id: z.string(),
  }),
).mutation(async ({ input }) => {

  const invoice = await prisma.invoice.findUnique({
    where: {
      id: input.id,
    },
    select: invoiceSelect,
  }) as Invoice;

  if (invoice.status === InvoiceStatus.PAID) {
    await patientPaymentReceipt(invoice, invoice.patient.organization);
  } else if (invoice.status === InvoiceStatus.PENDING) {
    await patientInvoice(invoice, invoice.patient.organization);
  }

  return invoice;
});
