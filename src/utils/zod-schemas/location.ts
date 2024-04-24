import z from 'zod';
import { LocationType } from '@prisma/client';


export const LocationSchema = z.object({
  id: z.string().min(1, { message: 'This is required' }),
  display_name: z.string().min(1, { message: 'This is required' }),
  value: z.string().min(1, { message: 'This is required' }),
  type: z.nativeEnum(LocationType),
});

export type LocationInput = z.infer<typeof LocationSchema>;
