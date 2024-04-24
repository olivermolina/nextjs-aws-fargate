import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import prisma from '../../../libs/prisma';
import { ServiceWithStaff } from '../../../types/service';
import { serviceSelect } from './index';

export const getService = isAuthenticated
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const service = await prisma.service.findUnique({
      where: {
        id: input.id,
      },
      select: serviceSelect,
    });

    return service as ServiceWithStaff;
  });
