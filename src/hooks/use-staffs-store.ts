import { trpc } from '../app/_trpc/client';
import { Prisma, User, UserType } from '@prisma/client';
import { useMemo } from 'react';

export const useStaffsStore = () => {
  const { data, isLoading } = trpc.user.list.useQuery(
    {
      type: [UserType.STAFF],
      sortDir: Prisma.SortOrder.asc,
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const staffs: User[] = useMemo(() => {
    const items = data?.items;
    return items || [];
  }, [data]);

  return { staffs, isLoading };
};
