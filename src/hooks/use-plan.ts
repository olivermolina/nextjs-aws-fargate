import { useDialog } from './use-dialog';
import { trpc } from '../app/_trpc/client';
import toast from 'react-hot-toast';

export const usePlan = () => {
  const dialog = useDialog();
  const { data: currentPlan, refetch } = trpc.organization.currentPlan.useQuery();
  const cancelMutation = trpc.organization.cancelPlan.useMutation();

  const onCancelPlan = async () => {
    try {
      await cancelMutation.mutateAsync(undefined);
      await refetch();
      toast.success('Plan cancelled. Access will be revoked.');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const mutation = trpc.organization.changePlan.useMutation();

  const onChangePlan = async (currentPlanId: string, newPlanId: string, additionalUsers: number) => {
    if (!newPlanId) {
      toast.error('Please select a plan.');
      return;
    }

    try {
      await mutation.mutateAsync({
        currentPlanId,
        newPlanId,
        additionalUsers,
      });
      await refetch();
      toast.success('Plan changed. Next invoice will be updated.');
    } catch (e) {
      toast.error(e.message);
    }
  };
  return {
    currentPlan,
    onChangePlan,
    isLoading: mutation.isLoading,
    cancelPlan: {
      isLoading: cancelMutation.isLoading,
      dialog,
      onCancelPlan,
    },
  };
};
