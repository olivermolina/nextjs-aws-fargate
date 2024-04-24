import z from 'zod';

export const ServiceValidationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: 'This is required' }),
  duration: z.coerce.number().min(0, 'Duration is required').optional().nullable(),
  price: z.coerce.number().min(0, 'Price is required').optional().nullable(),
  code: z.string().optional().nullable(),
  displayName: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  staffIds: z.array(z.string()).optional(),
  telemedicine: z.boolean().optional().nullable(),
  taxable: z.boolean().optional().nullable(),
  service_color: z.string().optional().nullable(),
});

export type ServiceInput = z.infer<typeof ServiceValidationSchema>;

export const ServicesValidationSchema = z.object({
  services: z.array(ServiceValidationSchema),
});

export type ServicesInput = z.infer<typeof ServicesValidationSchema>;
