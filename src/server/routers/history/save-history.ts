import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { ObjectId } from 'bson';
import { HistoryValidationSchema } from '../../../utils/zod-schemas/history';

const saveHistory = isAuthenticated.input(HistoryValidationSchema).mutation(async ({ input }) => {
  const { id, ...restInput } = input;

  return prisma.history.upsert({
    where: {
      id: input.id === 'new' ? new ObjectId().toString('hex') : input.id,
    },
    create: restInput,
    update: restInput,
  });
});
export default saveHistory;
