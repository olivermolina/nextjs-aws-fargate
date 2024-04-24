import { isAuthenticated } from '../middleware/isAuthenticated';
import { UserType } from '@prisma/client';
import prisma from 'src/libs/prisma';

const patientListOptions = isAuthenticated.query(async ({ ctx }) => {
  return await prisma.user.findMany({
    where: {
      type: UserType.PATIENT,
      organization_id: ctx.user.organization_id,
    },
  });
});

export default patientListOptions;
