import sendgrid from '../../libs/sendgrid';
import Stripe from 'stripe';
import { getUserFullName } from '../get-user-full-name';
import numeral from 'numeral';
import { Address, Organization, User } from '@prisma/client';
import renderPdfStripeInvoiceToBuffer from '../render-pdf-stripe-invoice-to-buffer';
import { format } from 'date-fns';


export const subscriptionPaidInvoice = async (
  invoice: Stripe.Invoice,
  organization: Organization & {
    billing_address: Address | null;
  },
  adminStaff: User
) => {
  const templateId = 'd-b9e41bd7839449c297a083e50368682d';
  try {
    // Render the React component to a PDF buffer
    const buffer = await renderPdfStripeInvoiceToBuffer(invoice);
    const email = organization.bill_email || adminStaff.email ||organization.email;
    if (!email) {
      return {
        code: 'failed',
        message: 'Email failed to be sent. No email address found.',
      };
    }

    const currency = invoice.currency || '$';
    const items = invoice.lines.data;
    const mainInvoiceItem = items.find((item) => (item.plan?.product as Stripe.Product).metadata?.type === 'plan' || (item.plan?.product as Stripe.Product).metadata?.type === 'enterprise');
    const additionalUsersInvoiceItem = items.find((item) => (item.plan?.product as Stripe.Product).metadata?.type === 'additional_users');

    await sendgrid.send({
      from: 'contact@lunahealth.app',
      templateId,
      personalizations: [
        {
          to: email,
          dynamicTemplateData: {
            admin_name: getUserFullName(adminStaff),
            invoice_id: invoice.number,
            invoice_number: invoice.number,
            organization_name: organization.name,
            organization_billing_address: organization.billing_address?.address_line1,
            organization_billing_city: organization.billing_address?.city,
            organization_billing_state: organization.billing_address?.state,
            organization_billing_postal_code: organization.billing_address?.postal_code,
            organization_billing_country: organization.billing_address?.country,
            invoice_date: invoice.created && format(invoice.created * 1000, 'dd MMM yyyy'),
            tax: numeral(Number(invoice.tax) / 100).format(`${currency}0,0.00`),
            total : numeral(Number(invoice.total) / 100).format(`${currency}0,0.00`),
            plan_name: mainInvoiceItem?.description,
            plan_price: mainInvoiceItem?.amount && numeral(Number(mainInvoiceItem?.amount) / 100).format(`${currency}0,0.00`),
            extra_users: additionalUsersInvoiceItem?.quantity,
            extra_users_price: additionalUsersInvoiceItem?.amount && numeral(Number(additionalUsersInvoiceItem?.amount) / 100).format(`${currency}0,0.00`),
          },
        },
      ],
      attachments: [
        {
          content: Buffer.from(buffer).toString('base64'),
          filename: `invoice-${invoice.number}.pdf`,
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
