import z from 'zod';
import { Gender, UserType } from '@prisma/client';

export const UpdateUserValidationSchema = z.object({
  id: z.string().min(1, { message: 'ID is required.' }),
  username: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  bill_name: z.string().optional(),
  phone: z.string().optional(),
  identification_number: z.string().optional(),
  email: z
    .string()
    .email({
      message: 'Invalid email. Please enter a valid email address.',
    })
    .optional(),
  birthdate: z.date().optional(),
  assignedStaffs: z.union([z.array(z.string()).optional(), z.string().optional()]).optional(),
  patient_notes: z.string().optional(),
  timezone: z.string().optional(),
  type: z.nativeEnum(UserType).optional(),
  active: z.boolean().optional(),
  avatar: z.string().optional(),
  gender: z.nativeEnum(Gender).optional(),
  address: z
    .object({
      address_line1: z.string(),
      address_line2: z.string().optional().nullable(),
      city: z.string(),
      state: z.string(),
      postal_code: z.string(),
      country: z.string().optional(),
    })
    .optional(),
  billing_address: z
    .object({
      address_line1: z.string(),
      address_line2: z.string().optional().nullable(),
      city: z.string(),
      state: z.string(),
      postal_code: z.string(),
      country: z.string().optional(),
    })
    .optional(),
  signature: z.string().optional(),
  intakes: z.array(z.string()).optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserValidationSchema>;
