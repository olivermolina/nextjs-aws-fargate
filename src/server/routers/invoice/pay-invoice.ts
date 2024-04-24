import { Invoice } from '../../../types/invoice';
import {
  Address,
  InvoiceStatus,
  Organization,
  StripePaymentMethod,
  StripeUserPaymentMethod,
  Tax,
  User,
} from '@prisma/client';
import prisma from '../../../libs/prisma';
import { chargePatient } from '../../../utils/stripe/charge-patient';
import { invoiceSelect } from './invoice-select';
import { patientPaymentReceipt } from '../../../utils/send-mail';
import { TRPCError } from '@trpc/server';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';

export type UserInvoiceType = User & {
  organization: Organization & {
    billing_address: Address | null;
    Tax: Tax | null;
  };
  StripeUserPaymentMethods: (StripeUserPaymentMethod & {
    stripe_payment_method: StripePaymentMethod | null;
  })[];
};

export const payInvoice = async (invoice: Invoice, user: UserInvoiceType) => {
  if (invoice.status === InvoiceStatus.PAID) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Invoice already paid',
    });
  }

  if (invoice.status === InvoiceStatus.CANCELED) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Can\'t pay canceled invoice',
    });
  }

  const organization = user.organization;

  const stripeConnect = await prisma.stripeConnect.findFirst({
    where: {
      organization_id: user.organization_id,
    },
  });

  if (!stripeConnect) throw new Error('Stripe Connect not found');

  const hasPaymentMethod = user.StripeUserPaymentMethods?.length > 0;
  if (!hasPaymentMethod) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'No payment method found',
    });
  }

  const stripeCustomerId = user.StripeUserPaymentMethods?.[0]?.stripe_customer_id;
  if (!stripeCustomerId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'No Stripe Customer ID found',
    });
  }

  const stripePaymentMethodId =
    user.StripeUserPaymentMethods?.[0]?.stripe_payment_method?.stripe_id;
  if (!stripePaymentMethodId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'No Stripe Payment Method ID found',
    });
  }

  try {
    const charge = await chargePatient({
      stripeAccountId: stripeConnect.stripe_user_id,
      stripeCustomerId: stripeCustomerId,
      stripePaymentMethodId: stripePaymentMethodId,
      amount: invoice.total_amount * 100, // convert to cents
      currency: organization.currency?.toLowerCase() as 'can' | 'usd' | 'mex',
    });
    if (charge) {
      console.log('Sending payment receipt email');
      // Update invoice status
      invoice = (await prisma.invoice.update({
        where: {
          id: invoice.id,
        },
        data: {
          status: InvoiceStatus.PAID,
        },
        select: invoiceSelect,
      })) as Invoice;
      // Send payment receipt email
      await patientPaymentReceipt(invoice, user.organization, charge);
    }
  } catch (e) {
    console.log(e);
  }
};

export default isAuthenticated
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    const invoice = (await prisma.invoice.findUnique({
      where: {
        id: input.id,
      },
      select: invoiceSelect,
    })) as Invoice;

    if (!invoice) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invoice not found',
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: invoice.patient_id,
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

    return await payInvoice(invoice, user);
  });
