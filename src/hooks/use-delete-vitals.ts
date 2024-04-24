import toast from 'react-hot-toast';
import { trpc } from '../app/_trpc/client';

export const useDeleteVitals = () => {
  const mutation = trpc.vitals.delete.useMutation();
  const onDiscard = async (id?: string, callback?: () => void) => {
    try {
      if (id && id !== 'new') {
        await mutation.mutateAsync({
          id,
        });
        toast.success('Vitals has been discarded');
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
