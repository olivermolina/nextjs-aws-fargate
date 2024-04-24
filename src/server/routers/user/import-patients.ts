import { PatientValidationSchema } from 'src/types/patient';
import z from 'zod';
import { Gender, UserType } from '@prisma/client';
import prisma from 'src/libs/prisma';
import { createUniqueUsername } from 'src/utils/create-unique-username';
import loadStytch from '../../../libs/stytch';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { createOrUpdateAddress } from '../../../utils/create-or-update-address';
import { extractFullAddress } from '../../../utils/extract-full-address';
import { Member } from 'stytch/types/lib/b2b/organizations';

const importPatients = isAuthenticated
  .input(
    z.array(
      PatientValidationSchema.and(
        z.object({
          gender: z.nativeEnum(Gender),
          address: z.string().optional(),
          status: z.boolean().optional(),
        })
      )
    )
  )
  .mutation(async ({ input, ctx }) => {
    const organization = await prisma.organization.findUniqueOrThrow({
      where: {
        id: ctx.user.organization_id,
      },
      include: {
        address: true,
      },
    });

    return prisma.$transaction(
      async (trx) => {
        const stytchB2BClient = loadStytch();
        return await Promise.all(
          input.map(async (patient) => {
            try {
              const username = await createUniqueUsername(patient);
              const user = await trx.user.create({
                data: {
                  email: patient.email,
                  username,
                  organization_id: ctx.user.organization_id,
                  stytch_member_id: '',
                  first_name: patient.first_name,
                  last_name: patient.last_name,
                  type: UserType.PATIENT,
                  phone: patient.phone,
                  password_hash: '',
                  active: patient.status,
                  gender: patient.gender,
                  birthdate: patient.birthdate,
                },
              });

              if (patient.address) {
                const address = extractFullAddress(patient.address);
                await createOrUpdateAddress(
                  {
                    id: user.address_id,
                    address_line1: address.address1 || '',
                    address_line2: address.address2 || '',
                    postal_code: address.zip || '',
                    city: address.city || '',
                    state: address.state || '',
                    country: organization?.address?.country || '',
                  },
                  user.id,
                  'user',
                  'primary',
                  trx as typeof prisma,
                );
              }

              const stytchExistingMember = await stytchB2BClient.organizations.members.search({
                query: {
                  operator: 'OR',
                  operands: [{ filter_name: 'member_emails', filter_value: [patient.email] }],
                },
                organization_ids: [organization.stytch_id],
                limit: 1,
              });

              let stytchMember: Member | null = null;
              if (stytchExistingMember.members.length === 0) {
                const newStytchUser = await stytchB2BClient.organizations.members.create({
                  organization_id: ctx.user.organization.stytch_id,
                  email_address: patient.email,
                  create_member_as_pending: true,
                });
                stytchMember = newStytchUser.member;
              } else {
                stytchMember = stytchExistingMember.members[0];
              }

              return await trx.user.update({
                where: {
                  id: user.id,
                },
                data: {
                  stytch_member_id: stytchMember.member_id,
                },
              });
            } catch (e) {
              console.log(e.message);
            }
          })
        );
      },
      {
        maxWait: 600000, // default: 2000
        timeout: 600000, // default: 5000
      }
    );
  });

export default importPatients;
