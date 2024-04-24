import { ConsultationTrpcResponse } from './index';
import { InvoiceStatus, Status } from '@prisma/client';
import { triggerAppointmentAutoCapture } from '../invoice/create-invoice';
import prisma from '../../../libs/prisma';
import { invoiceSelect } from '../invoice/invoice-select';
import { Invoice } from '../../../types/invoice';
import { createConsultationInvoice } from './create-consultation-invoice';

export const createInvoiceOnCompletedStatus = async (consultation: ConsultationTrpcResponse) => {
  if (consultation.status === Status.COMPLETED) {
    console.log('Creating invoice for consultation on Completed status', consultation.id);

    if (!consultation.invoice_id) {
      // Create invoice and pay
      await createConsultationInvoice(consultation);
    } else {
      // Pay invoice if not paid
      const invoice = await prisma.invoice.findUnique({
        where: {
          id: consultation.invoice_id,
        },
        select: invoiceSelect,
      });

      if (!invoice) throw new Error('Invoice not found');

      if (invoice.status === InvoiceStatus.PAID) return; // Already paid

      const user = await prisma.user.findUnique({
        where: {
          id: consultation.user_id,
        },
        include: {
          StripeUserPaymentMethods: {
            include: {
              stripe_payment_method: true,
            },
          },
          organization: {
            include: {
              Tax: true,
              billing_address: true,
            },
          },
        },
      });

      if (!user) throw new Error('User not found');

      await triggerAppointmentAutoCapture(invoice as Invoice, user);
    }
  }
};
