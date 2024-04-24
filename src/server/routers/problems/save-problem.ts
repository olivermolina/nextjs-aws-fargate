import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { ObjectId } from 'bson';
import { ProblemValidationSchema } from '../../../utils/zod-schemas/problem';

const saveProblem = isAuthenticated.input(ProblemValidationSchema).mutation(async ({ input }) => {
  const { id, code, ...restInput } = input;

  return prisma.problem.upsert({
    where: {
      id: input.id === 'new' ? new ObjectId().toString('hex') : input.id,
    },
    create: {
      ...restInput,
      title: restInput.title || '',
      ...(code && {
        code: code as string[],
      }),
    },
    update: {
      ...restInput,
      ...(code && {
        code: code as string[],
      }),
    },
  });
});
export default saveProblem;
