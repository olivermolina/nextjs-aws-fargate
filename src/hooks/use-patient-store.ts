import { trpc } from 'src/app/_trpc/client';
import { Prisma, UserType } from '@prisma/client';

export const usePatientsStore = () => {
  const { data, isLoading } = trpc.user.list.useQuery(
    {
      type: [UserType.PATIENT],
      sortDir: Prisma.SortOrder.asc,
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const patients = data?.items || [];

  return { patients, isLoading };
};
