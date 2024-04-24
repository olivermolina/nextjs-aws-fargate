import { Service, ServiceAssignStaff, User } from '@prisma/client';

export type ServiceWithStaff = Service & {
  staffs: (ServiceAssignStaff & {
    Staff: User;
  })[];
};
