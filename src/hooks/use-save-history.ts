import { History } from '@prisma/client';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import { trpc } from '../app/_trpc/client';
import toast from 'react-hot-toast';
import { HistoryInput } from '../utils/zod-schemas/history';
import { v4 as uuid } from 'uuid';

export const useSaveHistory = (userId: string, optimisticUpdate = true) => {
  const queryClient = useQueryClient();
  const queryKey = getQueryKey(
    trpc.history.list,
    {
      userId,
    },
    'query',
  );

  const mutation = trpc.history.save.useMutation({
    // When mutate is called:
    onMutate: async (saveHistory) => {
      // Only use optimistic updates if the user wants to
      if (!optimisticUpdate) return;

      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey, {
        exact: true,
      });
      const history: History = {
        ...saveHistory,
        id: uuid(), // generate a new id
        relationship: saveHistory.relationship || null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      let newData: History[] = [];
      if (saveHistory.id === 'new') {
        newData =
          previousData && Array.isArray(previousData)
            ? [...(previousData as History[]), history]
            : [history];
      } else {
        newData =
          previousData && Array.isArray(previousData)
            ? (previousData as History[]).map((p) => {
              if (p.id === saveHistory.id) {
                return history;
              }
              return p;
            })
            : [history];
      }
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

  const onSubmit = async (input: HistoryInput, callback?: any) => {
    try {
      const result = await mutation.mutateAsync(input);
      callback?.(result);
      toast.success(
        input.id === 'new'
          ? 'New patient history has been added.'
          : 'Patient history has been updated'
      );
    } catch (e) {
      toast.error(e.message);
    }
  };

  return {
    mutation,
    onSubmit,
  };
};
