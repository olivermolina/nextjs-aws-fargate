import z from 'zod';
import { AddressValidationSchema } from './address';

export const CheckoutBillingValidationSchema = z
  .object({
    bill_email: z.string().email({
      message: 'Invalid email. Please enter a valid email address',
    }),
    bill_name_on_card: z.string().min(1, { message: 'This is required' }),
    bill_first_name: z.string().min(1, { message: 'This is required' }),
    bill_last_name: z.string().min(1, { message: 'This is required' }),
    subscriptionId: z.string().min(1, { message: 'This is required' }),
    additionalUsers: z.number(),
    address: AddressValidationSchema,
    stripePaymentMethodId: z.string().optional(),
    promotionCode: z.string().optional(),
  })
  .superRefine((data, refinementContext) => {
    const { stripePaymentMethodId, promotionCode } = data;

    if (promotionCode && !stripePaymentMethodId) {
      return refinementContext.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Card details is required',
        path: ['stripePaymentMethodId'],
      });
    }
  });

export type CheckoutBillingInput = z.infer<typeof CheckoutBillingValidationSchema>;
