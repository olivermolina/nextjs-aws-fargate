import Grid from '@mui/material/Unstable_Grid2';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import WarningIcon from '@mui/icons-material/Warning';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import CloseIcon from '@untitled-ui/icons-react/build/esm/XClose';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import { Elements } from '@stripe/react-stripe-js';
import PaymentMethodForm from '../../../components/payment-method-form';
import { usePatientPaymentMethod } from '../../../hooks/use-patient-payment-method';
import { useAuth } from '../../../hooks/use-auth';
import { AuthContextType } from '../../../contexts/auth/jwt';
import { UserType } from '@prisma/client';
import numeral from 'numeral';
import { useEffect, useMemo } from 'react';
import { Skeleton } from '@mui/material';
import { useSelector } from '../../../store';

interface CustomerPaymentMethodProps {
  customerId: string;
  isShowing?: boolean; // Show the payment method in the schedule page for patients
  chargeAmount?: number;
  showTitle?: boolean;
  hideButtons?: boolean;
  triggerSubmit?: boolean;
  stopTriggerSubmit?: (paymentMethodId?: string) => Promise<void>;
  hasEditAccess?: boolean;
  isSchedulePage?: boolean;
}

export default function CustomerPaymentMethod(props: CustomerPaymentMethodProps) {
  const { showTitle = true, isShowing, hasEditAccess = true, isSchedulePage } = props;
  const { user: authUser } = useAuth<AuthContextType>();
  const scheduledUser = useSelector((state) => state.schedule.user);
  const paymentMethod = usePatientPaymentMethod(
    props.customerId,
    isSchedulePage ? scheduledUser?.organization_id : authUser?.organization_id,
  );

  useEffect(() => {
    if (!paymentMethod.data && isShowing) {
      paymentMethod.toggleEdit();
    }
  }, [paymentMethod.data, isShowing]);

  const user = useMemo(() => {
    if (isSchedulePage && scheduledUser) {
      return scheduledUser;
    }

    return authUser;
  }, [isSchedulePage, scheduledUser, authUser]);

  if (user?.type === UserType.PATIENT && !paymentMethod.stripePromise && !isShowing) {
    return null;
  }

  return (
    <Grid
      xs={12}
      lg={4}
    >
      <Card>
        {showTitle && <CardHeader title="Payment Method " />}
        <CardContent>
          {!paymentMethod.stripePromise && user?.type === UserType.STAFF ? (
            <Stack
              direction={'row'}
              justifyContent="flex-start"
              alignItems="center"
              spacing={2}
              sx={{ backgroundColor: 'error.light', p: 1, borderRadius: 0.5 }}
            >
              <WarningIcon color={'warning'} />
              <Typography variant={'caption'}>
                Please connect your Stripe account to enable online payments. <br />
                Go to <strong>Account</strong> &gt; <strong>Organization</strong> &gt;{' '}
                <strong>Online Payments</strong> to enable.
              </Typography>
            </Stack>
          ) : (
            <>
              {!props.hideButtons && hasEditAccess && (
                <Box
                  sx={{
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  {paymentMethod.edit ? (
                    <Button
                      color="inherit"
                      onClick={paymentMethod.onCancel}
                      startIcon={
                        <SvgIcon>
                          <CloseIcon />
                        </SvgIcon>
                      }
                    >
                      Cancel
                    </Button>
                  ) : (
                    <Button
                      color="inherit"
                      onClick={paymentMethod.toggleEdit}
                      startIcon={
                        <SvgIcon>
                          <Edit02Icon />
                        </SvgIcon>
                      }
                    >
                      Edit
                    </Button>
                  )}
                </Box>
              )}
              <Box
                sx={{
                  mt: 1,
                }}
              >
                {!paymentMethod.stripePromise && paymentMethod.edit && isShowing && (
                  <Stack
                    direction={'column'}
                    spacing={2}
                  >
                    <Skeleton
                      variant={'rectangular'}
                      height={30}
                    />
                    <Stack
                      direction={'row'}
                      spacing={2}
                      justifyContent={'space-between'}
                    >
                      <Skeleton
                        variant={'rectangular'}
                        width={'100%'}
                        height={30}
                      />
                      <Skeleton
                        variant={'rectangular'}
                        width={'100%'}
                        height={30}
                      />
                    </Stack>
                  </Stack>
                )}

                {paymentMethod.stripePromise && paymentMethod.edit && (
                  <Elements stripe={paymentMethod.stripePromise}>
                    <PaymentMethodForm
                      handleSubmit={paymentMethod.handleSubmit}
                      isLoading={paymentMethod.isLoading}
                      triggerSubmit={props.triggerSubmit}
                      hideSaveButton={props.hideButtons}
                      stopTriggerSubmit={props.stopTriggerSubmit}
                    />
                  </Elements>
                )}

                {!paymentMethod.edit && (
                  <Stack>
                    <Typography variant="body2">
                      {paymentMethod.data &&
                        isSchedulePage &&
                        `The credit card on file ${paymentMethod.data?.stripe_payment_method?.brand?.toUpperCase()} ending in ***${paymentMethod
                          .data?.stripe_payment_method?.last4} will be charged ${numeral(
                          props.chargeAmount
                        ).format('0.00')} to book the appointment.`}
                      {paymentMethod.data &&
                        !isSchedulePage &&
                        `Credit
                      Card: ${paymentMethod.data?.stripe_payment_method?.brand?.toUpperCase()} ending in ${paymentMethod
                        .data?.stripe_payment_method?.last4}`}
                      {!paymentMethod.data && 'No credit card on file.'}
                    </Typography>
                  </Stack>
                )}
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
}
