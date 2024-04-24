import Grid from '@mui/material/Unstable_Grid2';
import {
  StripeTextFieldCVC,
  StripeTextFieldExpiry,
  StripeTextFieldNumber,
} from './stripe-common-textfield';
import React, { useEffect } from 'react';
import {
  StripeCardCvcElementChangeEvent,
  StripeCardExpiryElementChangeEvent,
  StripeCardNumberElementChangeEvent,
} from '@stripe/stripe-js';
import { useElements, useStripe } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';


interface PaymentMethodFormProps {
  handleSubmit: any;
  isLoading: boolean;
  buttonLabel?: string;
  hideSaveButton?: boolean;
  triggerSubmit?: boolean;
  stopTriggerSubmit?: (paymentMethodId?: string) => Promise<void>;
}

const PaymentMethodForm = (props: PaymentMethodFormProps) => {
  const stripe = useStripe();
  const elements = useElements();

  const [state, setState] = React.useState<Record<string, boolean | string | null>>({
    cardNumberComplete: false,
    expiredComplete: false,
    cvcComplete: false,
    cardNumberError: null,
    expiredError: null,
    cvcError: null,
  });

  const submitPaymentMethod = async () => {
    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    await elements.submit();

    const cardNumber = elements.getElement('cardNumber');

    let stripePaymentMethodId: string | undefined = undefined;
    if (cardNumber) {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumber,
      });

      if (error) {
        toast.error(error.message || 'Something went wrong. Please try again.');
      }

      if (!error && !paymentMethod) {
        toast.error('Unable to create payment method. Please try again.');
      }

      stripePaymentMethodId = paymentMethod?.id;
    }

    if (stripePaymentMethodId) {
      await props.handleSubmit(stripePaymentMethodId);
    }

    props.stopTriggerSubmit?.(stripePaymentMethodId);
  };

  const onSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitPaymentMethod();
  };

  const { cardNumberError, expiredError, cvcError } = state;
  const onElementChange =
    (field: string, errorField: string) =>
      ({
         complete,
         error,
       }:
         | StripeCardNumberElementChangeEvent
         | StripeCardExpiryElementChangeEvent
         | StripeCardCvcElementChangeEvent) => {
        // @ts-ignore
        setState({ ...state, [field]: complete, [errorField]: error?.message });
      };

  useEffect(() => {
    if (props.triggerSubmit) {
      submitPaymentMethod();
    }
  }, [props.triggerSubmit]);

  return (
    <form onSubmit={onSubmit}>
      <Grid
        container
        spacing={3}
        maxWidth="sm"
      >
        <Grid
          xs={12}
        >
          <StripeTextFieldNumber
            fullWidth
            label="Card Number"
            error={Boolean(cardNumberError)}
            labelErrorMessage={(cardNumberError as string) || undefined}
            onChange={onElementChange('cardNumberComplete', 'cardNumberError')}
          />
        </Grid>
        <Grid
          xs={6}
        >
          <StripeTextFieldExpiry
            fullWidth
            label="Expiry Date"
            error={Boolean(expiredError)}
            labelErrorMessage={(expiredError as string) || undefined}
            onChange={onElementChange('expiredComplete', 'expiredError')}
          />
        </Grid>
        <Grid
          xs={6}
        >
          <StripeTextFieldCVC
            fullWidth
            label="CVV"
            error={Boolean(cvcError)}
            labelErrorMessage={(cvcError as string) || undefined}
            onChange={onElementChange('cvcComplete', 'cvcError')}
          />
        </Grid>
        {!props.hideSaveButton && (
          <Grid
            xs={12}
          >
            <Button
              type="submit"
              variant={'contained'}
              disabled={props.isLoading}
            >
              {props.buttonLabel || 'Save Payment Information'}
              {props.isLoading && (
                <CircularProgress
                  sx={{ ml: 1 }}
                  size={20}
                />
              )}
            </Button>
          </Grid>
        )}
      </Grid>
    </form>
  );
};

export default PaymentMethodForm;
