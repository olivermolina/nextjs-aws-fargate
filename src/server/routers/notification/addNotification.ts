import prisma from '../../../libs/prisma';
import { Prisma, RoleName, UserType } from '@prisma/client';

type AddNotificationType = {
  organizationId: string;
  toUserIds: string[];
  notificationsCreateManyInput: Omit<Prisma.NotificationCreateManyInput, 'to_user_id'>;
  deleted?: boolean;
};

export const addNotification = async (input: AddNotificationType) => {
  // Get admin users
  const adminUsers = await prisma.user.findMany({
    where: {
      organization_id: input.organizationId,
      role: {
        name: RoleName.ADMIN,
      },
      type: UserType.STAFF,
      NOT: {
        id: {
          in: [...input.toUserIds, input.notificationsCreateManyInput.from_user_id],
        },
      },
    },
  });
  // Get admin users ids
  const adminIds = adminUsers.length > 0 ? adminUsers.map((user) => user.id) : [];

  return prisma.notification.createMany({
    data: [...adminIds, ...input.toUserIds].map((staffId) => ({
      ...input.notificationsCreateManyInput,
      to_user_id: staffId,
      deleted: input.deleted,
    })),
  });
};
