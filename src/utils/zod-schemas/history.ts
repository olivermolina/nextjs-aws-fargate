import z from 'zod';
import { HistoryType, Relationship } from '@prisma/client';

export const HistoryValidationSchema = z.object({
  id: z.string(),
  user_id: z.string().min(1, { message: 'This is required' }),
  condition: z.string(),
  reaction: z.string().optional().nullish(),
  type: z.nativeEnum(HistoryType),
  relationship: z.nativeEnum(Relationship).optional().nullish(),
});

export type HistoryInput = z.infer<typeof HistoryValidationSchema>;
