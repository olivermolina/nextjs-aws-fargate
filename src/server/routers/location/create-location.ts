import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { LocationSchema } from '../../../utils/zod-schemas/location';

const createLocation = isAuthenticated.input(LocationSchema).mutation(async ({ input, ctx }) => {
  const { id, ...data } = input;
  return prisma.location.create({
    data: {
      ...data,
      organization_id: ctx.user.organization_id,
    },
  });
});
export default createLocation;
