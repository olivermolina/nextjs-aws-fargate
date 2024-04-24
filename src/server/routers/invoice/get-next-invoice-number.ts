import { isAuthenticated } from '../middleware/isAuthenticated';
import prisma from '../../../libs/prisma';
import { Prisma } from '@prisma/client';
import { getInitials } from '../../../utils/get-initials';
import { getUserFullName } from '../../../utils/get-user-full-name';
import { padStart } from 'lodash';

export const getNextInvoiceNumber = isAuthenticated.query(async ({ input, ctx }) => {
  const lastInvoices = await prisma.invoice.findMany({
    take: 1,
    where: {
      patient: {
        organization_id: ctx.user.organization_id,
      },
    },
    orderBy: {
      assigned_number: Prisma.SortOrder.desc,
    },
  });

  const initials = getInitials(getUserFullName(ctx.user));
  if (!lastInvoices || !lastInvoices[0]) {
    return 'INV-0001-' + initials;
  }
  const lastAssignedNumber = Number(lastInvoices[0].assigned_number) + 1;
  return 'INV-' + padStart(lastAssignedNumber.toString(), 4, '0') + '-' + initials;
});
