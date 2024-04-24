import z from 'zod';
import { AllergyStatus } from '@prisma/client';

export const AllergyValidationSchema = z.object({
  id: z.string(),
  user_id: z.string().min(1, { message: 'This is required' }),
  name: z.string().optional().nullable(),
  reaction: z.string().optional().nullable(),
  status: z.nativeEnum(AllergyStatus).optional(),
  onset_date: z.date().optional(),
});


export type AllergyInput = z.infer<typeof AllergyValidationSchema>;
