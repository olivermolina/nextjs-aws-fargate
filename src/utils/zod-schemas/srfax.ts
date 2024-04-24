import z from 'zod';

export const SrFaxValidationSchema = z.object({
  account_number: z.string().min(1, 'SRFax Account number is required'),
  access_password: z.string().min(1, 'SRFax Access password is required'),
  fax_number: z.string().length(10, 'SRFax number must be 10 digits'),
});

export type SrFaxInput = z.infer<typeof SrFaxValidationSchema>;
