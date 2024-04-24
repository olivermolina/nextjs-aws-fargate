import { useOrganizationStore } from './use-organization';
import { trpc } from '../app/_trpc/client';
import { useCallback, useMemo, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';

export const usePatientPaymentMethod = (userId?: string, organizationId?: string) => {
  const organization = useOrganizationStore(organizationId);
  const { data, refetch } = trpc.user.getPatientPaymentMethod.useQuery(
    {
      id: userId!,
    },
    {
      enabled: !!userId,
      refetchOnWindowFocus: false,
    }
  );

  const mutation = trpc.user.savePatientPaymentMethod.useMutation();
  const [edit, setEdit] = useState(false);
  const toggleEdit = () => setEdit((prev) => !prev);
  const onCancel = () => {
    toggleEdit();
  };

  const stripePromise = useMemo(() => {
    if (!organization.data?.StripeConnect?.[0]?.stripe_user_id) {
      return null;
    }
    return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '', {
      stripeAccount: organization.data?.StripeConnect?.[0]?.stripe_user_id || '',
    });
  }, [organization.data]);

  const handleSubmit = useCallback(
    async (stripePaymentMethodId: string) => {
      if (!userId) {
        toast.error('User not found.');
        return;
      }

      try {
        await mutation.mutateAsync({
          id: userId,
          stripePaymentMethodId,
        });
        toast.success('Payment method updated.');
        await refetch();
        toggleEdit();
      } catch (e) {
        toast.error(e.message);
      }
    },
    [userId],
  );

  return {
    edit,
    toggleEdit,
    onCancel,
    handleSubmit,
    data,
    isLoading: mutation.isLoading,
    stripePromise,
    refetch,
  };
};
