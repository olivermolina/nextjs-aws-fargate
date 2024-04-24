import z from 'zod';
import prisma from 'src/libs/prisma';
import loadStripeClient from '../../../libs/stripe';
import { TRPCError } from '@trpc/server';
import { RoleName } from '@prisma/client';
import { subscriptionPaidInvoice } from '../../../utils/send-mail';
import { publicProcedure } from '../../trpc';

export const sendInvoicePaidNotification = publicProcedure
  .input(z.object({
    stripeInvoiceId: z.string(),
  }))
  .mutation(async ({ input }) => {
    const stripe = loadStripeClient();
    const invoice = await stripe.invoices.retrieve(input.stripeInvoiceId, {
      expand: ['lines.data.plan.product'],
    });
    const stripeCustomerId = invoice.customer as string;

    const stripeOrganization = await prisma.stripeOrganizationPaymentMethod.findFirst({
      where: {
        stripe_customer_id: stripeCustomerId,
      },
    });

    if (!stripeOrganization) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Stripe customer not found',
      });
    }

    const organization = await prisma.organization.findUnique({
      where: {
        id: stripeOrganization.organization_id,
      },
      include: {
        billing_address: true,
      },
    });

    if (!organization) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Organization not found',
      });
    }

    const adminStaff = await prisma.user.findFirst({
      where: {
        organization_id: organization.id,
        role: {
          name: RoleName.ADMIN,
        },
      },
    });

    if (!adminStaff) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Admin staff not found',
      });
    }

    return await subscriptionPaidInvoice(invoice, organization, adminStaff);

  });
