import { renderToBuffer } from '@joshuajaco/react-pdf-renderer-bundled';
import { InvoicePdfDocument } from '../sections/dashboard/invoice/invoice-pdf-document';
import { Invoice } from '../types/invoice';
import { Address, Organization, Tax } from '@prisma/client';

export const renderPdfInvoiceToBuffer = (
  invoice: Invoice,
  organization: Organization & {
    billing_address: Address | null;
    Tax: Tax | null;
  },
) => {
  return renderToBuffer(
    <InvoicePdfDocument
      invoice={invoice}
      organization={organization}
    />,
  );
};

export default renderPdfInvoiceToBuffer;
