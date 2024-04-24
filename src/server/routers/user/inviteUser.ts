import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import prisma from 'src/libs/prisma';
import { TRPCError } from '@trpc/server';
import { createOrInviteStytchMember } from './createOrInviteStytchMember';
import { sendPatientCustomizeWelcomeEmail } from '../../../utils/send-mail';
import { Patient } from '../../../types/patient';
import { userSelect } from './listUsers';

/**
 * Invite a user to the organization
 *
 * @param id - The user ID
 *
 * @returns The user Object
 */
const inviteUser = isAuthenticated
  .input(
    z.object({
      id: z.string(),
      to: z.string().optional(),
      body: z.string().optional(),
      subject: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: input.id,
      },
      select: userSelect,
    });

    const stytchMember = await createOrInviteStytchMember({
      email: user.email,
      stytch_organization_id: ctx.user.organization.stytch_id,
      invited_by_member_id: ctx.user.stytch_member_id,
      action: 'invite',
    });

    if (!stytchMember) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: "Couldn't find the user. Please contact support.",
      });
    }
    if (input.body && input.subject && input.to) {
      await sendPatientCustomizeWelcomeEmail({
        body: input.body,
        subject: input.subject,
        to: input.to,
        patient: user as Patient,
      });
    }

    return await prisma.user.update({
      where: {
        id: input.id,
      },
      data: {
        stytch_member_id: stytchMember.member_id,
      },
    });
  });

export default inviteUser;
