import { renderToBuffer } from '@joshuajaco/react-pdf-renderer-bundled';
import Stripe from 'stripe';
import {
  AccountInvoicePdfDocument,
} from '../sections/dashboard/account/account-invoice-pdf-document';

export const renderPdfStripeInvoiceToBuffer = (invoice: Stripe.Invoice) => {
  return renderToBuffer(<AccountInvoicePdfDocument invoice={invoice} />);
};

export default renderPdfStripeInvoiceToBuffer;
