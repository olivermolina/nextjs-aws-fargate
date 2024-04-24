import {
  InvoiceCreateInput,
  InvoiceCreateValidationSchema,
} from '../../../utils/zod-schemas/invoice';
import prisma from '../../../libs/prisma';
import { InvoiceStatus, Prisma } from '@prisma/client';
import { getInitials } from '../../../utils/get-initials';
import { getUserFullName } from '../../../utils/get-user-full-name';
import { padStart } from 'lodash';
import { createServiceSlug } from '../../../utils/create-service-slug';
import { serviceSelect } from '../service';
import { invoiceSelect } from './invoice-select';
import { Invoice } from '../../../types/invoice';
import { payInvoice, UserInvoiceType } from './pay-invoice';
import { patientInvoice } from '../../../utils/send-mail/patient-invoice';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { TRPCError } from '@trpc/server';

export const triggerAppointmentAutoCapture = async (
  invoice: Invoice,
  user: UserInvoiceType,
  forceAutoCapture = false,
  deleteInvoiceIfFailed = false,
) => {
  const organization = user.organization;
  const hasPaymentMethod = user.StripeUserPaymentMethods?.length > 0;

  // auto capture payment if enabled
  if ((organization.appointment_payment_auto_capture || forceAutoCapture) && hasPaymentMethod) {
    console.log('Capturing payment for invoice', invoice.id);
    try {
      await payInvoice(invoice, user);
    } catch (e) {
      console.log(e);
      if (deleteInvoiceIfFailed) {
        console.log('Deleting invoice', invoice.id);
        await prisma.invoice.delete({
          where: {
            id: invoice.id,
          },
        });
      }
    }
  }

  // Send invoice if no payment method
  if (organization.appointment_auto_send_invoice && !hasPaymentMethod) {
    console.log('Sending invoice email');
    await patientInvoice(invoice, organization);
  }

};

export const createInvoice = async (
  input: InvoiceCreateInput,
  organizationId: string,
  staffId: string,
  forceAutoCapture = false,
  deleteInvoiceIfFailed = false,
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: input.patientId,
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

  if (!user) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'User not found',
    });
  }

  const lastInvoice = await prisma.invoice.findMany({
    where: {
      patient: {
        organization_id: organizationId,
      },
    },
    orderBy: {
      assigned_number: Prisma.SortOrder.desc,
    },
  });

  const staff = await prisma.user.findUniqueOrThrow({
    where: {
      id: staffId,
    },
  });

  const lastAssignedNumber = lastInvoice[0]?.assigned_number + 1 || 1;
  const initials = getInitials(getUserFullName(staff));
  const nextInvoiceNumber = `INV-${padStart((Number(lastAssignedNumber) + 1).toString(), 4, '0')}-${initials}`;

  const invoiceNumber =
    input.invoiceNumber || nextInvoiceNumber;

  const totalAmount = input.invoiceItems.reduce((acc, item) => {
    return acc + item.cost;
  }, 0);

  const invoiceItems = await prisma.$transaction(async (trx) => {
    let invoiceItems = [];
    for (let item of input.invoiceItems) {
      const service = await trx.service.findFirst({
        where: {
          name: item.service?.name || '',
        },
      });

      if (service) {
        invoiceItems.push({
          ...item,
          serviceId: service?.id,
        });
      } else {
        const slug = await createServiceSlug({
          name: item?.service?.name,
          organization_id: organizationId,
        });
        const newService = await prisma.service.create({
          data: {
            name: item?.service?.name || '',
            slug,
            duration: 0,
            price: item.cost || 0,
            organization_id: organizationId,
            created_by_id: staffId,
            ...(input.staffIds && {
              staffs: {
                createMany: {
                  data: input.staffIds.map((id) => ({
                    staff_id: id,
                  })),
                },
              },
            }),
            type: 'custom',
          },
          select: serviceSelect,
        });
        invoiceItems.push({
          ...item,
          serviceId: newService.id,
        });
      }
    }
    return invoiceItems;
  });
  let invoice = await prisma.invoice.create({
    data: {
      patient_id: input.patientId,
      staffs: {
        createMany: {
          data: input.staffIds.map((staffId) => ({
            staff_id: staffId,
          })),
        },
      },
      status: InvoiceStatus.PENDING,
      invoice_number: invoiceNumber,
      assigned_number: lastAssignedNumber,
      due_date: new Date(),
      total_amount: totalAmount,
      subtotal_amount: 0,
      tax_amount: 0,
      InvoiceItems: {
        createMany: {
          data: invoiceItems.map((item) => ({
            description: item.description || item.service?.name || '',
            quantity: 1,
            unit_amount: item.cost,
            total_amount: item.cost,
            service_id: item.serviceId,
          })),
        },
      },
    },
    select: invoiceSelect,
  }) as Invoice;

  console.log('Created invoice', invoice.id);
  await triggerAppointmentAutoCapture(invoice, user, forceAutoCapture, deleteInvoiceIfFailed);

  return invoice;
};

export default isAuthenticated.input(InvoiceCreateValidationSchema)
  .mutation(async ({
                     input,
                     ctx,
                   }) => {
    return await createInvoice(input, ctx.user.organization_id, ctx.user.id);
  });
