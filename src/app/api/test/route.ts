import { NextRequest, NextResponse } from 'next/server';
import { appRouter } from 'src/server';

/**
 * Test endpoint to send invoice paid notification manually
 * @param _req
 */
async function handler(_req: NextRequest) {
  const body = await _req.json();
  const invoiceId = body?.invoice_id;

  const caller = appRouter.createCaller({} as any);

  const response = await caller.organization.sendInvoicePaidNotification({
    stripeInvoiceId: invoiceId,
  });

  return NextResponse.json(response);
}

export const POST = handler;
