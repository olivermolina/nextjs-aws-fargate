import sendgrid from '../../libs/sendgrid';
import { Invoice } from '../../types/invoice';
import Stripe from 'stripe';
import { getUserFullName } from '../get-user-full-name';
import numeral from 'numeral';
import dayjs from 'dayjs';
import { renderPdfInvoiceToBuffer } from '../index';
import { Address, Organization, Tax } from '@prisma/client';

export const patientPaymentReceipt = async (
  invoice: Invoice,
  organization: Organization & {
    billing_address: Address | null;
    Tax: Tax | null;
  },
  paymentIntent?: Stripe.PaymentIntent,
) => {
  const templateId = 'd-38bcdec63cc64c54bf641240630963c8';
  try {
    // Render the React component to a PDF buffer
    const buffer = await renderPdfInvoiceToBuffer(invoice, organization);

    const amount = paymentIntent ? paymentIntent.amount / 100 : invoice.total_amount;
    const paymentDate = paymentIntent ? dayjs(paymentIntent.created * 1000).format('MM/DD/YYYY') : dayjs(invoice.updated_at).format('MM/DD/YYYY');

    await sendgrid.send({
      from: 'contact@lunahealth.app',
      templateId,
      personalizations: [
        {
          to: invoice.patient.email,
          dynamicTemplateData: {
            invoice_id: invoice.invoice_number,
            invoice_number: invoice.invoice_number,
            invoice_date: dayjs(invoice.created_at).format('MM/DD/YYYY'),
            clinic_name: organization.name,
            organization_name: organization.name,
            organization_address_line: organization.billing_address?.address_line1,
            organization_city: organization.billing_address?.city,
            organization_state: organization.billing_address?.state,
            organization_postal_code: organization.billing_address?.postal_code,
            staff_name: getUserFullName(invoice.staffs?.[0]?.Staff),
            customer_name: getUserFullName(invoice.patient),
            staff_email: invoice.staffs?.[0]?.Staff?.email,
            service_name: invoice.InvoiceItems?.[0]?.service?.name,
            price: numeral(invoice.InvoiceItems?.[0]?.total_amount).format('0.00'),
            tax: numeral(invoice.tax_amount).format('0.00'),
            total: numeral(invoice.total_amount).format('0.00'),
            amount: numeral(amount).format('0.00'),
            payment_date: dayjs(paymentDate).format('MM/DD/YYYY'),
          },
        },
      ],
      attachments: [
        {
          content: Buffer.from(buffer).toString('base64'),
          filename: `invoice-${invoice.invoice_number}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ],
    });
    return { code: 'success', message: 'Email has been successfully sent.' };
  } catch (e: any) {
    console.log(e.message);
    return {
      code: 'failed',
      message: e.response?.body || 'Email failed to be sent.',
    };
  }
};
