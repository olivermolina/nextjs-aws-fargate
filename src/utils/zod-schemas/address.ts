import z from 'zod';

export const AddressValidationSchema = z.object({
  address_line1: z.string().min(1, { message: 'This is required' }),
  address_line2: z.string().optional(),
  postal_code: z.string().min(1, { message: 'This is required' }),
  city: z.string().min(1, { message: 'This is required' }),
  state: z.string().min(1, { message: 'This is required' }),
  country: z.string().min(1, { message: 'This is required' }),
});

export const AddressUpdateValidationSchema = z.object({
  id: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional().nullable(),
  postal_code: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
});

export const AddressValidationSchemaWithId = AddressValidationSchema.extend({
  id: z.string().optional().nullable(),
});

export type AddressInputWithId = z.infer<typeof AddressValidationSchemaWithId>;

export type AddressInput = z.infer<typeof AddressValidationSchema>;
