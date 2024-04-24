import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  CheckoutBillingInput,
  CheckoutBillingValidationSchema,
} from '../utils/zod-schemas/checkout';
import { useCallback, useEffect } from 'react';
import { trpc } from '../app/_trpc/client';
import toast from 'react-hot-toast';
import { paths } from '../paths';
import { useRouter } from './use-router';
import { useAuth } from './use-auth';
import { AuthContextType } from '../contexts/auth/jwt';
import { useElements, useStripe } from '@stripe/react-stripe-js';

import { Status } from '@prisma/client';
import { AuthUser } from '../contexts/auth/jwt/auth-context';
import { useOrganizationStore } from './use-organization';

export const useCheckout = (percentOff: number) => {
  const organization = useOrganizationStore();
  const { user, setAuthUser } = useAuth<AuthContextType>();
  const stripe = useStripe();
  const elements = useElements();

  const methods = useForm<CheckoutBillingInput>({
    resolver: zodResolver(CheckoutBillingValidationSchema),
    mode: 'all',
    defaultValues: {
      bill_email: user?.email,
      bill_first_name: user?.first_name || '',
      bill_last_name: user?.last_name || '',
      subscriptionId: '',
      additionalUsers: 0,
      address: {
        address_line1: '',
        address_line2: '',
        postal_code: '',
        city: '',
        state: '',
        country: '',
      },
      stripePaymentMethodId: '',
      promotionCode: undefined,
    },
  });
  const mutation = trpc.organization.checkout.useMutation();

  const router = useRouter();

  const onSubmit = useCallback(
    async (data: CheckoutBillingInput) => {
      if (!stripe || !elements) {
        // Stripe.js hasn't yet loaded.
        // Make sure to disable form submission until Stripe.js has loaded.
        console.log('stripe not loaded');
        return;
      }

      const cardNumber = elements.getElement('cardNumber');

      let stripePaymentMethodId: string | undefined = undefined;
      if (cardNumber && !data.promotionCode) {
        const { error, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardNumber,
        });

        if (error) {
          toast.error(error.message || 'Something went wrong. Please try again.');
          return;
        }

        if (!paymentMethod) {
          toast.error('Unable to create payment method. Please try again.');
          return;
        }

        stripePaymentMethodId = paymentMethod?.id;
      }

      try {
        await mutation.mutateAsync({
          ...data,
          stripePaymentMethodId: stripePaymentMethodId,
        });
        await setAuthUser({
          ...user,
          organization: {
            ...user?.organization,
            status: Status.COMPLETED,
          },
        } as AuthUser);
        await organization.refetch();
        toast.success('Success!');
        router.push(paths.dashboard.index);
      } catch (e) {
        toast.error(e.message);
      }
    },
    [stripe, elements],
  );

  useEffect(() => {
    if (percentOff) {
      methods.setValue('stripePaymentMethodId', undefined);
    }
  }, [percentOff]);

  return {
    methods,
    onSubmit,
    isLoading: mutation.isLoading,
  };
};
