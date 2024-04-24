import { User } from '@prisma/client';
import { getUserFullName } from './get-user-full-name';

export const getStaffNameById = (staffId: string, staffs: User[]) => {
  const staff = staffs.find((staff) => staff.id === staffId);
  if (!staff) return '';

  return getUserFullName(staff);
};
