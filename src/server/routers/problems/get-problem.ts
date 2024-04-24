import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import { TRPCError } from '@trpc/server';
import { isOwnedByOrganization } from '../../../utils/is-owned-by-organization';

const getProblem = isAuthenticated
  .input(
    z.object({
      id: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    const problem = await prisma.problem.findFirst({
      where: {
        id: input.id,
      },
      include: {
        user: true,
      },
    });

    if (!problem) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Patient problem not found',
      });
    }

    isOwnedByOrganization(ctx.user.organization_id, problem.user);

    return problem;
  });

export default getProblem;
