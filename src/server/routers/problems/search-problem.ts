import { publicProcedure } from '../../trpc';
import { search } from '../../../libs/icd-api';
import z from 'zod';

const searchProblem = publicProcedure
  .input(
    z.object({
      query: z.string(),
    }),
  )
  .query(async ({ input }) => {
    return await search(input.query);
  });

export default searchProblem;
