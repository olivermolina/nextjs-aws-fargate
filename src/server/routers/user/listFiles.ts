import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import { Prisma, UserType } from '@prisma/client';
import prisma from 'src/libs/prisma';

const listFiles = isAuthenticated
  .input(
    z.object({
      userId: z.string().optional(),
      query: z.string().optional(),
      rowsPerPage: z.number().min(5).max(1000),
      page: z.number().min(0),
      sortDir: z.nativeEnum(Prisma.SortOrder),
    })
  )
  .query(async ({ input, ctx }) => {
    const where: Prisma.FileWhereInput = {
      ...(input.query && {
        OR: [
          {
            name: {
              contains: input.query,
              mode: 'insensitive',
            },
          },
        ],
      }),
      ...(input.userId
        ? { user_id: input.userId }
        : {
            user: {
              organization_id: ctx.user.organization_id,
            },
          }),
      ...(ctx.user.type === UserType.PATIENT && {
        shared_with_patient: true,
      }),
    };

    const totalRowCount = await prisma.file.count({
      where,
    });

    const files = await prisma.file.findMany({
      skip: input.page * input.rowsPerPage,
      take: input.rowsPerPage,
      where,
      orderBy: {
        created_at: input.sortDir,
      },
      include: {
        user: true,
      },
    });

    return {
      items: files,
      meta: {
        totalRowCount,
      },
    };
  });

export default listFiles;
