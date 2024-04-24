import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import { TRPCError } from '@trpc/server';
import { isOwnedByOrganization } from '../../../utils/is-owned-by-organization';

const getTemplate = isAuthenticated
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const template = await prisma.template.findUnique({
      where: {
        id: input.id,
      },
    });

    if (!template) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Template not found',
      });
    }

    isOwnedByOrganization(ctx.user.organization_id, template);

    return template;
  });

export default getTemplate;
