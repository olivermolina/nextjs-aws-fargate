import z from 'zod';

export const AvailabilityValidationSchema = z.object({
  id: z.string().optional().nullable(),
  name: z.string().min(1, { message: 'This is required' }),
  user_id: z.string(),
  organization_id: z.string().optional().nullable(),
  timezone: z.string(),
  availabilitySlots: z.array(
    z.object({
      dayOfWeek: z.number(),
      daySlots: z.array(
        z.object({
          id: z.string(),
          start_time: z.date(),
          end_time: z.date(),
        })
      ),
    })
  ),
});

export type AvailabilityInput = z.infer<typeof AvailabilityValidationSchema>;
