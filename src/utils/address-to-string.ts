import { Address } from '@prisma/client';

export const addressToString = (address?: Address | null) => {
  if (!address) return '';

  return `${address.address_line1 || ''} ${address.address_line2 || ''},  ${
    address.postal_code || ''
  }
  ${address.city || ''}, ${address.state || ''}, ${address.country || ''}`;
};
