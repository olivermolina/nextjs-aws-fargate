import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { ObjectId } from 'bson';
import { VitalValidationSchema } from '../../../utils/zod-schemas/vital';

const saveVital = isAuthenticated.input(VitalValidationSchema).mutation(async ({ input }) => {
  const { id, ...restInput } = input;

  return prisma.vital.upsert({
    where: {
      id: input.id === 'new' ? new ObjectId().toString('hex') : input.id,
    },
    create: restInput,
    update: restInput,
  });
});
export default saveVital;
