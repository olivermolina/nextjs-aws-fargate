import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import { HistoryType } from '@prisma/client';

const listOptions = isAuthenticated
  .input(
    z.object({
      type: z.nativeEnum(HistoryType),
    }),
  )
  .query(async ({ input, ctx }) => {
    return prisma.history.findMany({
      where: {
        user: {
          organization_id: ctx.user.organization_id,
        },
        type: input.type,
      },
      distinct: ['condition'],
    });
  });

export default listOptions;
