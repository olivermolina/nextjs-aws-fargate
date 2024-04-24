import { trpc } from '../app/_trpc/client';
import { Prisma, UserType } from '@prisma/client';
import { useAuth } from './use-auth';

export const useCreateLog = () => {
  const { user } = useAuth();
  const mutation = trpc.log.create.useMutation();

  const save = (input: Omit<Prisma.LogUncheckedCreateInput, 'staff_id'>) => {
    if (input.user_id === '' || !user || user?.type === UserType.PATIENT) {
      return;
    }
    try {
      mutation.mutate(input);
    } catch (e) {
      console.log(e.message);
    }
  };

  return {
    mutation,
    save,
  };
};
