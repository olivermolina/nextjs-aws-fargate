import z from 'zod';
import { ProblemStatus } from '@prisma/client';

export const ProblemValidationSchema = z.object({
  id: z.string(),
  user_id: z.string().min(1, { message: 'This is required' }),
  title: z.string().min(1, { message: 'This is required' }).optional(),
  synopsis: z.string().optional().nullable(),
  status: z.nativeEnum(ProblemStatus).optional(),
  diagnostic_date: z.date().optional(),
  code: z.array(z.string()).optional().nullable(),
});

export type ProblemInput = z.infer<typeof ProblemValidationSchema>;
