import { isAuthenticated } from '../middleware/isAuthenticated';
import prisma from 'src/libs/prisma';

const availability = isAuthenticated.query(async ({ input, ctx }) => {
  return await prisma.availability.findFirst({
    where: {
      user_id: ctx.user.id,
    },
    include: {
      availability_slots: true,
    },
  });
});

export default availability;
