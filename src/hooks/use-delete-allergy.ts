import toast from 'react-hot-toast';
import { Allergy } from '@prisma/client';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import { trpc } from '../app/_trpc/client';

export const useDeleteAllergy = (userId: string) => {
  const queryClient = useQueryClient();
  const queryKey = getQueryKey(
    trpc.allergy.list,
    {
      userId,
    },
    'query',
  );

  const mutation = trpc.allergy.delete.useMutation({
    // When mutate is called:
    onMutate: async (deletedAllergy) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey, {
        exact: true,
      });
      const newData = (previousData as Allergy[])?.filter(
        (allergy: Allergy) => allergy?.id !== deletedAllergy.id,
      );
      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, newData);

      // // Return a context object with the snapshotted value
      return { previousData };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(queryKey, context?.previousData);
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
  const onDiscard = async (id?: string, callback?: () => void) => {
    try {
      if (id && id !== 'new') {
        await mutation.mutateAsync({
          id,
        });
        toast.success('Allergy has been discarded');
      }
      callback?.();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return {
    mutation,
    onDiscard,
  };
};
