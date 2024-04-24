import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import { Prisma } from '@prisma/client';
import prisma from 'src/libs/prisma';

const listSubFiles = isAuthenticated
  .input(
    z.object({
      folderFileId: z.string(),
      query: z.string().optional(),
      rowsPerPage: z.number().min(5).max(1000),
      page: z.number().min(0),
      sortDir: z.nativeEnum(Prisma.SortOrder),
    })
  )
  .query(async ({ input, ctx }) => {
    const where: Prisma.SubFileWhereInput = {
      file_id: input.folderFileId,
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
    };

    const totalRowCount = await prisma.subFile.count({
      where,
    });

    const subFiles = await prisma.subFile.findMany({
      skip: input.page * input.rowsPerPage,
      take: input.rowsPerPage,
      where,
      orderBy: {
        created_at: input.sortDir,
      },
      include: {
        file: {
          include: {
            user: true,
          },
        },
      },
    });

    return {
      items: subFiles,
      meta: {
        totalRowCount,
      },
    };
  });

export default listSubFiles;
