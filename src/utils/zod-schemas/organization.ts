import z from 'zod';
import { FileSchema } from './file-upload';

export const OrganizationValidationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: 'This is required' }),
  phone: z.string().optional().nullable(),
  npi: z.string().optional().nullable(),
  currency: z.string().optional().nullable(),
  tax_id: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  file: FileSchema.optional().nullable(),
  description: z.string().optional(),
  reminders_day_before: z.boolean().optional(),
  reminders_hour_before: z.boolean().optional(),
  sms_reminders_day_before: z.boolean().optional(),
  sms_reminders_hour_before: z.boolean().optional(),
  appointment_payment_auto_capture: z.boolean().optional(),
  appointment_auto_send_invoice: z.boolean().optional(),
  appointment_payment_required: z.boolean().optional(),
  telemedicine_auto_recording: z.boolean().optional(),
  appointment_request_enabled: z.boolean().optional(),
});

export type OrganizationInput = z.infer<typeof OrganizationValidationSchema>;
