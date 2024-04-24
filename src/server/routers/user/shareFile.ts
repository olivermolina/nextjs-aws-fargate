import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import prisma from 'src/libs/prisma';

const shareFile = isAuthenticated
  .input(
    z.object({
      id: z.string(),
      shareWithPatient: z.boolean(),
    })
  )
  .mutation(async ({ input }) => {
    return await prisma.file.update({
      where: {
        id: input.id,
      },
      data: {
        shared_with_patient: input.shareWithPatient,
      },
    });
  });

export default shareFile;
