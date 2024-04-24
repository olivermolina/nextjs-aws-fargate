import sendgrid from '../../libs/sendgrid';
import { Invoice } from '../../types/invoice';
import { getBaseUrl } from '../get-base-url';
import { renderPdfInvoiceToBuffer } from 'src/utils';
import { Address, Organization, Tax } from '@prisma/client';

export const patientInvoice = async (
  invoice: Invoice,
  organization: Organization & {
    billing_address: Address | null;
    Tax: Tax | null;
  },
) => {
  const templateId = 'd-5dc23128cec043d19ed505543d17f364';
  try {
    // Render the React component to a PDF buffer
    const buffer = await renderPdfInvoiceToBuffer(invoice, organization);

    await sendgrid.send({
      from: 'contact@lunahealth.app',
      templateId,
      personalizations: [
        {
          to: invoice.patient.email,
          dynamicTemplateData: {
            invoice_id: invoice.id,
            invoice_number: invoice.invoice_number,
            clinic_name: organization.name,
            first_name: invoice.patient.first_name,
            link: `${getBaseUrl()}/patient/invoices/${invoice.id}?pay=1`,
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
