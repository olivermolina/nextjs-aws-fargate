import { isAuthenticated } from '../middleware/isAuthenticated';
import prisma from '../../../libs/prisma';
import { getUserFullName } from '../../../utils/get-user-full-name';
import { Contact } from '../../../types/chat';

const getContacts = isAuthenticated.query(async ({ ctx }) => {
  const threads = await prisma.thread.findMany({
    where: {
      participantIds: {
        has: ctx.user.id,
      },
    },
  });

  const contactIds = threads
    .flatMap((thread) => thread.participantIds)
    .filter((id) => id !== ctx.user.id);

  const contacts = await prisma.user.findMany({
    where: {
      id: {
        in: contactIds,
      },
    },
  });

  return contacts.map(
    (contact) =>
      ({
        id: contact.id,
        avatar: contact.avatar,
        isActive: true,
        lastActivity: new Date().getTime(),
        name: getUserFullName(contact),
      }) as Contact
  );
});
export default getContacts;
