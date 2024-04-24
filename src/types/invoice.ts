import {
  Address,
  Invoice as PrismaInvoice,
  InvoiceItem,
  InvoiceStaff,
  Organization,
  Service,
  Tax,
  User,
} from '@prisma/client';

export type Invoice = PrismaInvoice & {
  staffs: (InvoiceStaff & {
    Staff: User & {
      organization: Organization & {
        address?: Address;
        Tax?: Tax;
      };
    };
  })[];
  patient: User & {
    address?: Address;
    billing_address?: Address;
    Tax?: Tax;
    organization: Organization & {
      billing_address: Address | null;
      Tax: Tax | null;
    };
  };
  InvoiceItems: (InvoiceItem & {
    service?: Service;
  })[];
};
