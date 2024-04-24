import z from 'zod';

export const ConfigureClinicalProfileValidationSchema = z.object({
  quick_notes: z.boolean(),
  allergies: z.boolean(),
  problems: z.boolean(),
  medications: z.boolean(),
  vitals: z.boolean(),
  vitals_subsections: z.array(z.string()),
  history: z.boolean(),
  history_subsections: z.array(z.string()),
});

export type ConfigureClinicalProfileInput = z.infer<
  typeof ConfigureClinicalProfileValidationSchema
>;
