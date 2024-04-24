import { TRPCError } from '@trpc/server';

export const isOwnedByOrganization = (
  organizationId: string,
  data: { organization_id?: string | null },
) => {
  if (!data.organization_id) {
    return;
  }

  if (organizationId !== data.organization_id) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You don\'t have permission to access this resource',
    });
  }
};
