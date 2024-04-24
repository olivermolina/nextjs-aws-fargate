import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import { TRPCError } from '@trpc/server';

const saveTag = isAuthenticated
  .input(
    z.object({
      name: z.string(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const { name } = input;

    // Reserved tag name
    if (name === 'Intake') {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Tag already exists',
      });
    }

    const tag = await prisma.templateTag.findUnique({
      where: {
        name,
        organization_id: ctx.user.organization_id,
      },
    });

    if (tag) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Tag already exists',
      });
    }

    return prisma.templateTag.create({
      data: {
        name,
        organization_id: ctx.user.organization_id,
      },
    });
  });

export default saveTag;
