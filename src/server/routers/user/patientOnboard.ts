import prisma from 'src/libs/prisma';
import { userSelect } from './listUsers';
import { User } from 'src/types/user';
import { UpdateUserValidationSchema } from 'src/utils/zod-schemas/user';
import { pickBy } from 'lodash';
import { createOrUpdateAddress } from 'src/utils/create-or-update-address';
import { publicProcedure } from '../../trpc';
import z from 'zod';
import bcrypt from 'bcrypt';
import loadStytch from '../../../libs/stytch';
import { TRPCError } from '@trpc/server';
import renderPdfTemplateToBuffer from '../../../utils/render-pdf-template-to-buffer';
import { uploadFileBuffer } from './uploadFileBuffer';
import { UserType } from '@prisma/client';

const patientOnboard = publicProcedure
  .input(UpdateUserValidationSchema.and(z.object({ password: z.string() })))
  .mutation(async ({ input }) => {
    const {
      password,
      signature,
      intakes,
      address,
      billing_address,
      timezone,
      id,
      assignedStaffs,
      ...rest
    } = input;

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
      include: {
        organization: true,
        staffs: true,
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

    if (password && input.email) {
      // Create patient password
      const stytchB2BClient = loadStytch();
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);
      try {
        await stytchB2BClient.passwords.migrate({
          organization_id: user.organization.stytch_id,
          email_address: input.email,
          hash: password_hash,
          hash_type: 'bcrypt',
        });
      } catch (e) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: e.error_message || e.message,
        });
      }
    }

    const documentsFolder = await prisma.file.findFirst({
      where: {
        user_id: user.id,
        name: 'Documents',
        type: 'folder',
      },
    });

    const folderId =
      documentsFolder?.id ||
      (
        await prisma.file.create({
          data: {
            user_id: user.id,
            name: 'Documents',
            type: 'folder',
            size: 0,
            s3_key: '',
            s3_bucket: '',
            shared_with_patient: true,
          },
        })
      ).id;

    // Attach signature to user
    if (signature) {
      const buffer = Buffer.from(signature.replace(/^data:.+;base64,/, ''), 'base64');
      await uploadFileBuffer({
        userId: user.id,
        buffer,
        fileName: 'onboard-consent-signature.png',
        type: 'image/png',
        rootFolder: `${user.organization_id}/${user.id}/Documents`,
        folderId: folderId,
        extension: 'png',
        userType: UserType.PATIENT,
        createdByUserId: user.id,
      });
    }

    // Attach pdf intakes to user Documents folder
    if (intakes) {
      await Promise.all(
        intakes.map(async (intake) => {
          const template = await prisma.template.findUnique({
            where: {
              id: intake,
            },
          });

          if (template) {
            const buffer = await renderPdfTemplateToBuffer(template);
            await uploadFileBuffer({
              userId: user.id,
              buffer,
              fileName: `${template.title.replace(/\s/g, '_')}.pdf`,
              type: 'application/pdf',
              rootFolder: `${user.organization_id}/${user.id}/Documents`,
              folderId: folderId,
              extension: 'pdf',
              signedDocument: true,
              userType: UserType.PATIENT,
              createdByUserId: user.id,
            });
          }
        })
      );

      const totalSize = await prisma.subFile.aggregate({
        where: {
          file_id: folderId,
        },
        _sum: {
          size: true,
        },
      });

      await prisma.file.update({
        where: {
          id: folderId,
        },
        data: {
          size: totalSize._sum?.size || 0,
        },
      });
    }

    return (await prisma.user.findUnique({
      where: {
        id: input.id,
      },
      select: userSelect,
    })) as User;
  });

export default patientOnboard;
