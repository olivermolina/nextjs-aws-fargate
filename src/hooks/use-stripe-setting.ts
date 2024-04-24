import { trpc } from '../app/_trpc/client';
import toast from 'react-hot-toast';

export const useStripeSetting = (refetch?: any) => {
  const mutation = trpc.organization.stripeConnectDeauthtorize.useMutation();
  const stripeAccountMutation = trpc.organization.createStripeAccount.useMutation();

  const handleConnect = async () => {
    try {
      const result = await stripeAccountMutation.mutateAsync();
      window.location.href = result.url;
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleDisconnectStripe = async () => {
    try {
      await mutation.mutateAsync();
      await refetch?.();
      toast.success('Stripe account disconnected');
    } catch (e) {
      toast.error(e.message);
    }
  };

  return {
    handleConnect,
    handleDisconnectStripe,
    mutation,
    stripeAccountMutation,
  };
};
