import { AddressInputWithId } from './zod-schemas/address';
import prisma from '../libs/prisma';

export const createOrUpdateAddress = async (
  address: AddressInputWithId,
  entityId: string,
  entity: 'user' | 'organization',
  type: 'primary' | 'billing',
  trx?: typeof prisma,
) => {
  const { id, address_line1, address_line2, postal_code, city, state, country } = address;

  const client = trx || prisma;

  if (id) {
    return client.address.update({
      where: {
        id,
      },
      data: {
        address_line1,
        address_line2,
        postal_code,
        city,
        state,
        country,
      },
    });
  }

  return client.address.create({
    data: {
      address_line1,
      address_line2,
      postal_code,
      city,
      state,
      country: country || '',
      ...(entity === 'user' &&
        type === 'primary' && {
          UserPrimaryAddresses: {
            connect: {
              id: entityId,
            },
          },
        }),
      ...(entity === 'user' &&
        type === 'billing' && {
          UserBillingAddresses: {
            connect: {
              id: entityId,
            },
          },
        }),
      ...(entity === 'organization' &&
        type === 'primary' && {
          OrganizationPrimaryAddresses: {
            connect: {
              id: entityId,
            },
          },
        }),
      ...(entity === 'organization' &&
        type === 'billing' && {
          OrganizationBillingAddresses: {
            connect: {
              id: entityId,
            },
          },
        }),
    },
  });
};
