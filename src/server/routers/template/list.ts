import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';

const list = isAuthenticated
  .input(
    z.object({
      query: z.string().optional(),
      tags: z.array(z.string()).optional(),
      shared: z.array(z.string()).optional(),
      profession: z.array(z.string()).optional(),
    }),
  )
  .query(async ({ input, ctx }) => {
    return prisma.template.findMany({
      where: {
        organization_id: ctx.user.organization_id,
        ...(input.query && {
          OR: [
            {
              title: {
                contains: input.query,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: input.query,
                mode: 'insensitive',
              },
            },
          ],
        }),
        ...(input.tags &&
          input.tags.length > 0 && {
            tags: {
              hasSome: input.tags,
            },
          }),
        ...(input.shared &&
          input.shared.length > 0 && {
            shared: {
              hasSome: input.shared,
            },
          }),
        ...(input.profession &&
          input.profession.length > 0 && {
            profession: {
              hasSome: input.profession,
            },
          }),
      },
    });
  });

export default list;
