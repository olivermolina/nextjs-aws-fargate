import z from 'zod';
import { User } from './user';
import { Invoice } from './invoice';
import {
  Address,
  Chart,
  Consultation,
  ConsultationStaff,
  File as PrismaFile,
  Invoice as PrismaInvoice,
  Notification,
  Service,
  SubFile,
  User as PrismaUser,
} from '@prisma/client';

export type Patient = User;

export type PatientWithInvoices = Patient & {
  PatientInvoices: Invoice[];
};

export const PatientValidationSchema = z.object({
  first_name: z.string().min(1, { message: 'This is required' }),
  last_name: z.string().min(1, { message: 'This is required' }),
  phone: z.string(),
  identification_number: z.string().optional(),
  email: z.string().email({
    message: 'Invalid email. Please enter a valid email address',
  }),
  birthdate: z.date().optional(),
  assignedStaffs: z.union([z.array(z.string()).optional(), z.string().optional()]).optional(),
  patient_notes: z.string().optional(),
});

export type PatientInput = z.infer<typeof PatientValidationSchema>;

export type PatientFeed = Notification & {
  File: PrismaFile | null;
  SubFile: SubFile | null;
  from_user: PrismaUser;
  to_user: PrismaUser;
  Consultation:
    | (Consultation & {
    service: Service | null;
    invoice: PrismaInvoice | null;
    Charts: (Chart & {
      signed_by: PrismaUser | null;
      user: PrismaUser & {
        address: Address | null;
      };
      created_by: PrismaUser;
    })[];
    staffs: ConsultationStaff[];
  })
    | null;
  Chart:
    | (Chart & {
    signed_by: PrismaUser | null;
    user: PrismaUser & {
      address: Address | null;
    };
    created_by: PrismaUser;
  })
    | null;
};
