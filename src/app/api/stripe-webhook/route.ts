import { NextRequest, NextResponse } from 'next/server';
import loadStripeClient from 'src/libs/stripe';
import { AppAccess } from '@prisma/client';
import { appRouter } from 'src/server';

async function handler(_req: NextRequest) {
  const body = await _req.text();
  const signature = _req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Invalid stripe signature' }, { status: 400 });
  }

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    return NextResponse.json({ error: 'Invalid endpoint secret' }, { status: 400 });
  }

  let event;
  try {
    const stripe = loadStripeClient();
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err) {
    NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    return;
  }
  const caller = appRouter.createCaller({} as any);

  console.log(event?.type);
  // Handle the event
  switch (event.type) {
    case 'invoice.paid':
    case 'invoice.payment_succeeded':
      const invoicePaid = event.data.object;
      if (!invoicePaid.customer) {
        NextResponse.json({ error: 'Invalid customer' }, { status: 400 });
        return;
      }
      try {
        await caller.organization.updateOrganizationAccess({
          stripeCustomerId: invoicePaid.customer as string,
          access: AppAccess.Allow,
        });

        // Send email notification to organization admin
        caller.organization.sendInvoicePaidNotification({
          stripeInvoiceId: invoicePaid.id,
        });
      } catch (e) {
        console.error('Failed to update organization access', invoicePaid.customer);
        return NextResponse.json({ error: e.message }, { status: 400 });
      }

      console.log("Setting access to 'Allow' for customer", invoicePaid.customer);
      return NextResponse.json({ data: invoicePaid });
    case 'customer.subscription.deleted':
      const customerSubscriptionDeleted = event.data.object;

      try {
        await caller.organization.updateOrganizationAccess({
          stripeCustomerId: customerSubscriptionDeleted.customer as string,
          access: AppAccess.Block,
        });
      } catch (e) {
        console.error('Failed to update organization access', customerSubscriptionDeleted.customer);
        return NextResponse.json({ error: e.message }, { status: 400 });
      }

      console.log("Setting access to 'Block' for customer", customerSubscriptionDeleted.customer);
      NextResponse.json({ data: customerSubscriptionDeleted });
      return NextResponse.json({ data: customerSubscriptionDeleted });
    case 'customer.subscription.updated':
      const customerSubscriptionUpdated = event.data.object;
      const { status } = customerSubscriptionUpdated;
      let access: AppAccess = AppAccess.Block;
      if (status === 'active') {
        access = AppAccess.Allow;
      }

      try {
        await caller.organization.updateOrganizationAccess({
          stripeCustomerId: customerSubscriptionUpdated.customer as string,
          access,
        });
      } catch (e) {
        console.error('Failed to update organization access', customerSubscriptionUpdated.customer);
        return NextResponse.json({ error: e.message }, { status: 400 });
      }

      console.log(`Setting access to '${access}' for customer`, customerSubscriptionUpdated.customer);
      NextResponse.json({ data: customerSubscriptionUpdated });
      return NextResponse.json({ data: customerSubscriptionUpdated });
    case 'invoice.payment_failed':
      const invoicePaymentFailed = event.data.object;
      try {
        await caller.organization.updateOrganizationAccess({
          stripeCustomerId: invoicePaymentFailed.customer as string,
          access: AppAccess.Block,
        });
      } catch (e) {
        console.error('Failed to update organization access', invoicePaymentFailed.customer);
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
      console.log("Setting access to 'Block' for customer", invoicePaymentFailed.customer);
      NextResponse.json({ data: invoicePaymentFailed });
      return;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ data: 'success' });
}

export { handler as POST };
