import { Prisma } from '@prisma/client';

export const invoiceSelect = Prisma.validator<Prisma.InvoiceSelect>()({
  id: true,
  title: true,
  invoice_number: true,
  assigned_number: true,
  patient_id: true,
  created_at: true,
  updated_at: true,
  due_date: true,
  status: true,
  total_amount: true,
  subtotal_amount: true,
  tax_amount: true,
  patient: {
    include: {
      address: true,
      billing_address: true,
      Tax: true,
      organization: {
        include: {
          billing_address: true,
          Tax: true,
        },
      },
    },
  },
  InvoiceItems: {
    include: {
      service: true,
    },
  },
  staffs: {
    include: {
      Staff: {
        include: {
          organization: true,
        },
      },
    },
  },
});
