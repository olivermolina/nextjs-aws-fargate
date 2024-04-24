import z from 'zod';
import { ChartItemType, ChartType } from '@prisma/client';

export const CreateChartSchema = z.object({
  userId: z.string().min(1, { message: 'This is required' }),
  type: z.nativeEnum(ChartType),
  name: z.string().min(1, { message: 'This is required' }),
  consultationId: z.string().optional(),
  service_datetime: z.date(),
});

export type CreateChartInput = z.infer<typeof CreateChartSchema>;

export const CreateItemChartSchema = z.object({
  chartId: z.string().optional(),
  userId: z.string().min(1, { message: 'This is required' }),
  itemType: z.nativeEnum(ChartItemType),
  consultationId: z.string().optional(),
  service_datetime: z.date(),
  order: z.number().optional(),
});


export type CreateChartItemInput = z.infer<typeof CreateItemChartSchema>;

export const UpdateChartSchema = z.object({
  id: z.string().min(1, { message: 'This is required' }),
  type: z.nativeEnum(ChartType),
  name: z.string().min(1, { message: 'This is required' }),
  free_text: z.string().optional().nullable(),
  subjective_text: z.string().optional().nullable(),
  objective_text: z.string().optional().nullable(),
  assessment_text: z.string().optional().nullable(),
  plan_text: z.string().optional().nullable(),
  consultation_id: z.string().optional(),
  assigned_to_id: z.string(),
});

export type UpdateChartInput = z.infer<typeof UpdateChartSchema>;
