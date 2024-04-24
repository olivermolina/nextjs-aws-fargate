import { t } from 'src/server/trpc';
import payInvoice from './pay-invoice';
import { resendInvoice } from './resend-invoice';
import { list } from './list';
import { getInvoice } from './get-invoice';
import createInvoice from './create-invoice';
import { getNextInvoiceNumber } from './get-next-invoice-number';

const invoiceRouter = t.router({
  list,
  get: getInvoice,
  create: createInvoice,
  getNextInvoiceNumber,
  pay: payInvoice,
  resendInvoice,
});

export default invoiceRouter;
