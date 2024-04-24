import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { LocationSchema } from '../../../utils/zod-schemas/location';

const updateLocation = isAuthenticated.input(LocationSchema).mutation(async ({ input }) => {
  const { id, ...data } = input;

  return prisma.location.update({
    where: {
      id,
    },
    data,
  });
});

export default updateLocation;
