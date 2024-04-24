import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import prisma from 'src/libs/prisma';
import loadStytch from '../../../libs/stytch';
import { LogAction } from '@prisma/client';
import { getUserFullName } from '../../../utils/get-user-full-name';

/**
 * Delete user
 *
 * @param id - The user ID
 * @returns The deleted user
 */

const deleteUser = isAuthenticated
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: input.id,
      },
      include: {
        organization: true,
      },
    });

    if (user.stytch_member_id) {
      try {
        const stytchB2BClient = loadStytch();
        await stytchB2BClient.organizations.members.delete({
          organization_id: user.organization.stytch_id,
          member_id: user.stytch_member_id,
        });
      } catch (e) {
        console.log(e.message);
      }
    }

    // Delete user staffs
    await prisma.userStaffs.deleteMany({
      where: {
        userId: {
          equals: input.id,
        },
      },
    });

    const deletedUser = await prisma.user.delete({
      where: { id: input.id },
    });

    await prisma.log.create({
      data: {
        user_id: deletedUser.id,
        text: `the patient ${getUserFullName(deletedUser)}`,
        staff_id: ctx.user.id,
        action: LogAction.DELETE,
      },
    });

    return deletedUser;
  });

export default deleteUser;
