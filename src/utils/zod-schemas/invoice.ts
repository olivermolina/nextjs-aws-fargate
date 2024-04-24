import z from 'zod';
import { ServiceWithStaff } from 'src/types/service';

export const InvoiceItemValidationSchema = z.object({
  id: z.string(),
  serviceId: z.string().optional(),
  service: z.custom<ServiceWithStaff>().refine((value) => !!value?.name, {
    message: "Service name can't be empty",
  }),
  description: z.string().optional(),
  code: z.string().optional(),
  cost: z.number(),
  isNew: z.boolean().optional(),
});
export type InvoiceItemInput = z.infer<typeof InvoiceItemValidationSchema>;

export const InvoiceCreateValidationSchema = z.object({
  title: z.string().optional(),
  patientId: z.string().min(1, 'Select at least patient'),
  staffIds: z
    .array(
      z.string({
        invalid_type_error: 'Select at least one staff',
        required_error: 'Select at least one staff',
      })
    )
    .refine((data) => data.length > 0, {
      message: 'Select at least one staff',
    }),
  invoiceNumber: z.string().optional(),
  vatNumber: z.string().optional(),
  orderNumber: z.string().optional(),
  issueDate: z.date(),
  dueDate: z.date(),
  description: z.string().optional(),
  invoiceItems: z.array(InvoiceItemValidationSchema).refine((data) => data.length > 0, {
    message: "Invoice items can't be empty",
  }),
});

export type InvoiceCreateInput = z.infer<typeof InvoiceCreateValidationSchema>;
