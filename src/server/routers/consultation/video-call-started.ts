import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import prisma from 'src/libs/prisma';

export const videoCallStarted = isAuthenticated
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    return prisma.consultation.update({
      where: {
        id: input.id,
      },
      data: {
        video_call_started_at: new Date(),
      },
    });
  });
