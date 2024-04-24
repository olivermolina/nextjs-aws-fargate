import {
  Consultation,
  File,
  Message,
  Notification as PrismaNotification,
  SubFile,
  User,
} from '@prisma/client';

export type Notification = PrismaNotification & {
  from_user: User;
  SubFile: SubFile | null;
  File: File | null;
  Consultation: Consultation | null;
  Message: Message | null;
};
