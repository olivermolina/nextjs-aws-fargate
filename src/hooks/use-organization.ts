import { trpc } from '../app/_trpc/client';
import { useAuth } from './use-auth';

export const useOrganizationStore = (id?: string) => {
  const { user } = useAuth();

  const { data, refetch, isLoading } = trpc.organization.getOrganizationById.useQuery(
    {
      id: id || user?.organization_id || '',
    },
    {
      enabled: !!id || !!user?.organization_id,
      refetchOnWindowFocus: false,
    },
  );
  return {
    data,
    refetch,
    isLoading,
  };
};
