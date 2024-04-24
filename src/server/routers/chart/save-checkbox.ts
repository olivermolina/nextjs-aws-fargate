import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';

const saveCheckbox = isAuthenticated
  .input(
    z.object({
      id: z.string(),
      label: z.string().optional().nullable(),
      value: z
        .array(
          z.object({
            key: z.string(),
            notes: z.string(),
            checked: z.boolean(),
          }),
        )
        .optional()
        .nullable(),
      options: z.array(z.string()).optional().nullable(),
      layout: z.enum(['horizontal', 'vertical', 'columns']).optional().nullable(),
      include_note: z.boolean().optional().nullable(),
      hide_unchecked_after_signing: z.boolean().optional().nullable(),
      required: z.boolean().optional().nullable(),
    }),
  )
  .mutation(async ({ input }) => {
    return prisma.chartCheckBox.update({
      where: {
        id: input.id,
      },
      data: {
        ...(input.label && { label: input.label }),
        ...(input.layout && { layout: input.layout }),
        ...(input.options && { options: input.options }),
        ...(input.value && { value: input.value }),
        ...(input.include_note && { include_note: input.include_note }),
        ...(input.hide_unchecked_after_signing && {
          hide_unchecked_after_signing: input.hide_unchecked_after_signing,
        }),
        ...(input.required && { required: input.required }),
      },
    });
  });
export default saveCheckbox;
