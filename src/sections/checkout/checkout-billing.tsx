import React, { FC, useEffect } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { useFormContext } from 'react-hook-form';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Unstable_Grid2';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { CheckoutBillingInput } from 'src/utils/zod-schemas/checkout';
import {
  StripeTextFieldCVC,
  StripeTextFieldExpiry,
  StripeTextFieldNumber,
} from 'src/components/stripe-common-textfield';
import {
  StripeCardCvcElementChangeEvent,
  StripeCardExpiryElementChangeEvent,
  StripeCardNumberElementChangeEvent,
} from '@stripe/stripe-js';
import { useElements } from '@stripe/react-stripe-js';
import MenuItem from '@mui/material/MenuItem';

interface PaymentMethod {
  label: string;
  value: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    label: 'Credit/Debit Card',
    value: 'card',
  },
];

interface CheckoutBillingProps {
  percentOff: number;
}

export const CheckoutBilling: FC<CheckoutBillingProps> = (props) => {
  const elements = useElements();
  const {
    register,
    formState: { errors, isValidating },
  } = useFormContext<CheckoutBillingInput>();
  const { percentOff, ...other } = props;
  const [state, setState] = React.useState<Record<string, boolean | string | null>>({
    cardNumberComplete: false,
    expiredComplete: false,
    cvcComplete: false,
    cardNumberError: null,
    expiredError: null,
    cvcError: null,
  });

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
    if (!elements || !isValidating) return;

    const cardNumber = elements.getElement('cardNumber');
    // @ts-ignore
    const isEmpty = cardNumber?._empty;

    const cardExpiry = elements.getElement('cardExpiry');
    // @ts-ignore
    const isEmptyExpiry = cardExpiry?._empty;

    const cardCvc = elements.getElement('cardCvc');
    // @ts-ignore
    const isEmptyCvc = cardCvc?._empty;

    setState({
      cardNumberComplete: !isEmpty,
      expiredComplete: !isEmptyExpiry,
      cvcComplete: !isEmptyCvc,
      cardNumberError: isEmpty ? 'Card number is required.' : null,
      expiredError: isEmptyExpiry ? 'Card expiry date is required.' : null,
      cvcError: isEmptyCvc ? 'Security code is required.' : null,
    });

    elements.submit();
  }, [isValidating, elements]);

  const { cardNumberError, expiredError, cvcError } = state;
  return (
    <Stack
      {...other}
      spacing={6}
    >
      <Stack spacing={3}>
        <Stack
          alignItems="center"
          direction="row"
          spacing={2}
        >
          <Box
            sx={{
              alignItems: 'center',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 20,
              display: 'flex',
              height: 40,
              justifyContent: 'center',
              width: 40,
            }}
          >
            <Typography
              sx={{ fontWeight: 'fontWeightBold' }}
              variant="h6"
            >
              1
            </Typography>
          </Box>
          <Typography variant="h6">Billing Address</Typography>
        </Stack>
        <div>
          <Grid
            container
            spacing={3}
          >
            <Grid
              xs={12}
              sm={4}
            >
              <TextField
                fullWidth
                label="First Name"
                {...register('bill_first_name')}
                error={!!errors?.bill_first_name}
                helperText={errors?.bill_first_name?.message}
              />
            </Grid>
            <Grid
              xs={12}
              sm={4}
            >
              <TextField
                fullWidth
                label="Last Name"
                {...register('bill_last_name')}
                error={!!errors?.bill_last_name}
                helperText={errors?.bill_last_name?.message}
              />
            </Grid>{' '}
            <Grid
              xs={12}
              sm={4}
            >
              <TextField
                fullWidth
                label="Email"
                {...register('bill_email')}
                error={!!errors?.bill_email}
                helperText={errors?.bill_email?.message}
              />
            </Grid>
            <Grid
              xs={12}
              sm={6}
            >
              <TextField
                fullWidth
                label="Street Address"
                {...register('address.address_line1')}
                error={!!errors?.address?.address_line1}
                helperText={errors?.address?.address_line1?.message}
              />
            </Grid>
            <Grid
              xs={12}
              sm={6}
            >
              <TextField
                fullWidth
                label="Street Line 2 (optional)"
                {...register('address.address_line2')}
              />
            </Grid>
            <Grid
              xs={12}
              sm={6}
            >
              <TextField
                fullWidth
                label="State"
                {...register('address.state')}
                error={!!errors?.address?.state}
                helperText={errors?.address?.state?.message}
              />
            </Grid>
            <Grid
              xs={12}
              sm={6}
            >
              <TextField
                fullWidth
                label="City"
                {...register('address.city')}
                error={!!errors?.address?.city}
                helperText={errors?.address?.city?.message}
              />
            </Grid>
            <Grid
              xs={12}
              sm={6}
            >
              <TextField
                fullWidth
                label="Zip"
                {...register('address.postal_code')}
                error={!!errors?.address?.postal_code}
                helperText={errors?.address?.postal_code?.message}
              />
            </Grid>
            <Grid
              xs={12}
              sm={6}
            >
              <TextField
                fullWidth
                label="Country"
                {...register('address.country')}
                error={!!errors?.address?.country}
                helperText={errors?.address?.country?.message}
                select
              >
                {['CA', 'MX', 'US'].map((option) => (
                  <MenuItem
                    key={option}
                    value={option}
                  >
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </div>
      </Stack>

      {!percentOff && (
        <Stack spacing={3}>
          <Stack
            alignItems="center"
            direction="row"
            spacing={2}
          >
            <Box
              sx={{
                alignItems: 'center',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 20,
                display: 'flex',
                height: 40,
                justifyContent: 'center',
                width: 40,
              }}
            >
              <Typography
                sx={{ fontWeight: 'fontWeightBold' }}
                variant="h6"
              >
                2
              </Typography>
            </Box>
            <Typography variant="h6">Payment Method</Typography>
          </Stack>
          <div>
            <div>
              <RadioGroup
                name="paymentMethod"
                sx={{ flexDirection: 'row' }}
                value={'card'}
              >
                {paymentMethods.map((paymentMethod) => (
                  <FormControlLabel
                    control={<Radio />}
                    key={paymentMethod.value}
                    label={<Typography variant="body1">{paymentMethod.label}</Typography>}
                    value={paymentMethod.value}
                  />
                ))}
              </RadioGroup>
            </div>
            <div>
              <Grid
                container
                spacing={3}
              >
                <Grid
                  xs={12}
                  sm={6}
                >
                  <TextField
                    fullWidth
                    label="Name on Card"
                    {...register('bill_name_on_card')}
                    error={!!errors?.bill_name_on_card}
                    helperText={errors?.bill_name_on_card?.message}
                  />
                </Grid>
                <Grid sm={6} />
                <Grid
                  xs={12}
                  sm={6}
                >
                  <StripeTextFieldNumber
                    fullWidth
                    label="Card Number"
                    error={Boolean(cardNumberError)}
                    labelErrorMessage={(cardNumberError as string) || undefined}
                    onChange={onElementChange('cardNumberComplete', 'cardNumberError')}
                  />
                </Grid>
                <Grid sm={6} />
                <Grid
                  xs={12}
                  sm={3}
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
                  xs={12}
                  sm={3}
                >
                  <StripeTextFieldCVC
                    fullWidth
                    label="CVV"
                    error={Boolean(cvcError)}
                    labelErrorMessage={(cvcError as string) || undefined}
                    onChange={onElementChange('cvcComplete', 'cvcError')}
                  />
                </Grid>
              </Grid>
            </div>
          </div>
        </Stack>
      )}
    </Stack>
  );
};

CheckoutBilling.propTypes = {
  // @ts-ignore
  billing: PropTypes.object,
  onChange: PropTypes.func,
};
