import { isAuthenticated } from '../middleware/isAuthenticated';
import { OrganizationValidationSchema } from 'src/utils/zod-schemas/organization';
import z from 'zod';
import { AddressUpdateValidationSchema } from 'src/utils/zod-schemas/address';
import prisma from 'src/libs/prisma';
import { uploadLogo } from 'src/utils/upload-log';
import loadStytch from 'src/libs/stytch';
import { createOrUpdateAddress } from 'src/utils/create-or-update-address';
import { pickBy } from 'lodash';

const MapCurrencySymbol: Record<string, string> = {
  USD: '$',
  CAD: '$',
  MXN: 'MX$',
};

export const updateOrganization = isAuthenticated
  .input(
    OrganizationValidationSchema.and(
      z.object({
        bill_name: z.string().optional(),
        bill_email: z.string().optional(),
        address: AddressUpdateValidationSchema.optional(),
        billing_address: AddressUpdateValidationSchema.optional(),
      })
    )
  )
  .mutation(async ({ input }) => {
    const { id, file, address, billing_address, currency, ...rest } = input;

    const organization = await prisma.organization.findUniqueOrThrow({
      where: {
        id,
      },
    });

    let logo = '';
    if (file) {
      logo = await uploadLogo(file, organization.id);
    }

    try {
      const stytchB2BClient = loadStytch();
      await stytchB2BClient.organizations.update({
        organization_id: organization.stytch_id,
        organization_name: input.name,
      });
    } catch (e) {
      console.log('Error updating organization name in stytch', e);
    }

    if (address) {
      await createOrUpdateAddress(
        {
          id: organization.address_id,
          address_line1: address.address_line1 || '',
          address_line2: address.address_line2 || '',
          postal_code: address.postal_code || '',
          city: address.city || '',
          state: address.state || '',
          country: address.country || '',
        },
        organization.id,
        'organization',
        'primary'
      );
    }

    if (billing_address) {
      await createOrUpdateAddress(
        {
          id: organization.billing_address_id,
          address_line1: billing_address.address_line1 || '',
          address_line2: billing_address.address_line2 || '',
          postal_code: billing_address.postal_code || '',
          city: billing_address.city || '',
          state: billing_address.state || '',
          country: billing_address.country || '',
        },
        organization.id,
        'organization',
        'billing'
      );
    }

    // Remove undefined/null values
    const updateInputs = pickBy(rest, (v) => v !== undefined && v !== null);

    return prisma.organization.update({
      where: {
        id,
      },
      data: {
        ...updateInputs,
        ...(currency && {
          currency_symbol: MapCurrencySymbol[currency],
        }),
        ...(logo && { logo }),
      },
    });
  });
