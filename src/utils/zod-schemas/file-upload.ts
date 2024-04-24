import z from 'zod';

export const FileSchema = z.object({
  name: z.string(),
  size: z.number(),
  type: z.string(),
  base64: z.string(),
});

export const UploadFileSchema = z.object({
  userId: z.string(),
  files: z.array(FileSchema),
  folderId: z.string().optional(),
});
export type FileInput = z.infer<typeof FileSchema>;
