import z from 'zod';
import { FileSchema } from './file-upload';

export const FaxSchema = z.object({
  recipient_first_name: z.string().min(1, { message: 'This is required' }),
  recipient_last_name: z.string().min(1, { message: 'This is required' }),
  to_number: z.string().length(10, { message: 'Invalid fax number' }),
  recipient_business_name: z.string().optional(),
  chart_id: z.string().optional(),
  file_id: z.string().optional(),
  include_cover_sheet: z.boolean().optional(),
  subject: z.string().optional(),
  remarks: z.string().optional(),
  include_header_per_page: z.boolean().optional(),
  attachments: z
    .array(
      FileSchema.and(
        z.object({
          id: z.string(),
          date: z.date(),
          user_id: z.string().optional(),
        }),
      ),
    )
    .optional(),
}).refine(data => {
  // If include_cover_sheet is true, subject must be defined and not empty
  if (data.include_cover_sheet === true) {
    return data.subject !== undefined && data.subject !== '';
  }
  // If include_cover_sheet is not true, no need to check file_id
  return true;
}, {
  // Custom error message
  message: 'Subject is required when Include cover sheet is enabled',
  path: ['subject'], // Specify the path of the field that this error is associated with
});

export type FaxInput = z.infer<typeof FaxSchema>;

export type FaxAttachment = {
  id: string;
  file_name: string;
  file_s3_key: string;
  file_type: string;
  date: Date;
  base64: string;
};
