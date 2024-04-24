import z from 'zod';

export const SchedulingLinkValidationSchema = z.object({
  id: z.string(),
  slug: z
    .string()
    .min(1, { message: 'Enter the unique slug for your scheduling link.' })
    .refine((value) => /^\S*$/.test(value), {
      message: 'No spaces are allowed.',
    }),
});

export type SchedulingLinkInput = z.infer<typeof SchedulingLinkValidationSchema>;
