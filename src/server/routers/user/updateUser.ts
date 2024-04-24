import { isAuthenticated } from '../middleware/isAuthenticated';
import prisma from 'src/libs/prisma';
import { userSelect } from './listUsers';
import { User } from 'src/types/user';
import { UpdateUserValidationSchema } from 'src/utils/zod-schemas/user';
import { pickBy } from 'lodash';
import { createOrUpdateAddress } from 'src/utils/create-or-update-address';
import { LogAction } from '@prisma/client';

/**
 *  Update user by id
 *  @param id - The user id
 *  @param email - The user email
 *  @param active - The user active
 *  @param avatar - The user avatar
 *  @returns The user
 *
 */
const updateUser = isAuthenticated
  .input(UpdateUserValidationSchema)
  .mutation(async ({ input, ctx }) => {
    const { address, billing_address, timezone, id, assignedStaffs, ...rest } = input;

    // Remove undefined values
    const updateUserInputs = pickBy(rest, (v) => v !== undefined);
    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        ...updateUserInputs,
        password_hash: '',
      },
    });

    if (
      input.assignedStaffs &&
      Array.isArray(input.assignedStaffs) &&
      input.assignedStaffs.length > 0
    ) {
      await prisma.userStaffs.deleteMany({
        where: {
          userId: user.id,
        },
      });

      await prisma.userStaffs.createMany({
        data: input.assignedStaffs.map((staffId) => ({
          userId: user.id,
          staffId: staffId,
        })),
      });
    }

    if (input.address) {
      await createOrUpdateAddress(
        {
          id: user.address_id,
          address_line1: input.address.address_line1 || '',
          address_line2: input.address.address_line2 || '',
          postal_code: input.address.postal_code || '',
          city: input.address.city || '',
          state: input.address.state || '',
          country: input.address.country || '',
        },
        user.id,
        'user',
        'primary',
      );
    }

    if (input.billing_address) {
      await createOrUpdateAddress(
        {
          id: user.billing_address_id,
          address_line1: input.billing_address.address_line1 || '',
          address_line2: input.billing_address.address_line2 || '',
          postal_code: input.billing_address.postal_code || '',
          city: input.billing_address.city || '',
          state: input.billing_address.state || '',
          country: input.billing_address.country || '',
        },
        user.id,
        'user',
        'billing',
      );
    }

    const updatedUser = (await prisma.user.findUnique({
      where: {
        id: input.id,
      },
      select: userSelect,
    })) as User;

    await prisma.log.create({
      data: {
        user_id: updatedUser.id,
        text: `the profile`,
        staff_id: ctx.user.id,
        action: LogAction.EDIT,
      },
    });

    return updatedUser;
  });

export default updateUser;
