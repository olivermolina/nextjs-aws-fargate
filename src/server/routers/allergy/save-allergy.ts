import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { AllergyValidationSchema } from '../../../utils/zod-schemas/allergy';
import { ObjectId } from 'bson';

const saveAllergy = isAuthenticated.input(AllergyValidationSchema).mutation(async ({ input }) => {
  const { id, name, onset_date, ...restInput } = input;

  return prisma.allergy.upsert({
    where: {
      id: input.id === 'new' ? new ObjectId().toString('hex') : input.id,
    },
    create: {
      ...restInput,
      name: name || 'New allergy',
      onset_date: onset_date || new Date(),
    },
    update: {
      ...restInput,
      ...(name && {
        name: input.name || '',
      }),
      ...(onset_date && {
        onset_date: input.onset_date,
      }),
    },
  });
});
export default saveAllergy;
