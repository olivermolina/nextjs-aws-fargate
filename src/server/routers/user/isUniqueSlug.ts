import { isAuthenticated } from '../middleware/isAuthenticated';
import prisma from 'src/libs/prisma';
import z from 'zod';

const isUniqueSlug = isAuthenticated
  .input(
    z.object({
      slug: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    const [organization, user] = await Promise.all([
      prisma.organization.findFirst({
        where: {
          slug: input.slug.toLowerCase(),
        },
      }),
      prisma.user.findFirst({
        where: {
          username: input.slug.toLowerCase(),
          NOT: {
            id: ctx.user.id,
          },
        },
      }),
    ]);

    return !(organization || user);
  });

export default isUniqueSlug;
