import z from 'zod';

export const VitalValidationSchema = z.object({
  id: z.string(),
  user_id: z.string().min(1, { message: 'This is required' }),
  date: z.date(),
  height: z.coerce.number().min(0, { message: 'Minimum value is 0' }).optional(),
  height_unit: z.string().optional(),
  weight: z.coerce.number().min(0, { message: 'Minimum value is 0' }).optional(),
  weight_unit: z.string().optional(),
  bmi: z.coerce.number().min(0, { message: 'Minimum value is 0' }).optional(),
  temperature: z.coerce.number().min(0, { message: 'Minimum value is 0' }).optional(),
  temperature_unit: z.string().optional().optional(),
  systolic: z.coerce.number().min(0, { message: 'Minimum value is 0' }).optional(),
  diastolic: z.coerce.number().min(0, { message: 'Minimum value is 0' }).optional(),
  respiratory_rate: z.coerce.number().min(0, { message: 'Minimum value is 0' }).optional(),
  heart_rate: z.coerce.number().min(1, { message: 'Minimum value is 0' }).optional(),
  oxygen_saturation: z.coerce.number().min(0, { message: 'Minimum value is 0' }).optional(),
});

export type VitalInput = z.infer<typeof VitalValidationSchema>;
