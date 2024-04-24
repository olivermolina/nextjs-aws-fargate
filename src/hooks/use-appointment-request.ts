import { Status } from '@prisma/client';
import toast from 'react-hot-toast';
import { useDialog } from './use-dialog';
import { trpc } from '../app/_trpc/client';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';

export const useAppointmentRequest = (id?: string, refetch?: any) => {
  const dialog = useDialog();
  const queryClient = useQueryClient();
  const queryKey = getQueryKey(trpc.notification.list, undefined, 'query');

  const mutation = trpc.consultation.update.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(queryKey);
    },
  });

  const handleSaveStatus = async (status: Status) => {
    if (!id) {
      toast.error('Failed to save consultation status');
      return;
    }

    try {
      await mutation.mutateAsync({
        id,
        status: status,
      });
      toast.success(
        status === Status.CONFIRMED ? 'Consultation confirmed' : 'Consultation declined',
      );
      refetch?.();
    } catch (e) {
      toast.error('Failed to save consultation status');
    }
  };
  const handleAccept = () => handleSaveStatus(Status.CONFIRMED);
  const handleDecline = () => {
    handleSaveStatus(Status.CANCELED);
    dialog.handleClose();
  };

  return {
    handleAccept,
    handleDecline,
    dialog,
    mutation,
  };
};
