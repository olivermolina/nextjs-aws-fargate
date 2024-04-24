import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import { LogAction } from '@prisma/client';

const createLog = isAuthenticated
  .input(
    z.object({
      user_id: z.string().optional().nullable(),
      text: z.string(),
      action: z.nativeEnum(LogAction),
      chart_id: z.string().optional().nullable(),
      consultation_id: z.string().optional().nullable(),
      file_id: z.string().optional().nullable(),
      sub_file_id: z.string().optional().nullable(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    return prisma.log.create({
      data: {
        ...input,
        staff_id: ctx.user.id,
      },
    });
  });
export default createLog;
