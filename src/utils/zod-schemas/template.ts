import z from 'zod';

export const TemplateValidationSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().min(1, { message: 'This is required' }),
    description: z.string().min(1, { message: 'This is required' }),
    content: z.string().min(1, { message: 'This is required' }),
    tags: z.array(z.string()).optional(),
    shared: z.array(z.string()).optional(),
    profession: z.array(z.string()).optional(),
  });

export type TemplateInput = z.infer<typeof TemplateValidationSchema>;
