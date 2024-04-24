import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useOrganizationStore } from '../../../hooks/use-organization';
import CircularProgress from '@mui/material/CircularProgress';
import StripeConnect from '../../../icons/stripe-connect';
import BackdropLoading from '../account/account-billing-reactivate-backdrop';
import React from 'react';
import { useStripeSetting } from '../../../hooks/use-stripe-setting';

type GettingStartedAcceptOnlinePaymentsProps = {
  handleNext: () => void;
};

export default function GettingStartedAcceptOnlinePayments({
                                                             handleNext,
                                                           }: GettingStartedAcceptOnlinePaymentsProps) {
  const { data, refetch } = useOrganizationStore();
  const {
    handleDisconnectStripe,
    handleConnect,
    mutation,
    stripeAccountMutation,
  } = useStripeSetting(refetch);

  return (
    <Container>
      <Stack
        spacing={1}
        alignItems={'center'}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'normal',
          }}
        >
          Make payments a breeze
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 'normal',
            pb: 2,
          }}
        >
          Get paid faster by enabling your clients to pay online. See all your invoices and payments
          in one place
        </Typography>

        {data?.StripeConnect?.[0]?.stripe_user_id ? (
          <Stack
            direction={'column'}
            spacing={2}
            alignItems={'center'}
          >
            <Typography
              variant={'h6'}
              sx={{
                color: 'success.main',
              }}
            >
              Stripe is successfully connected.
            </Typography>

            <Button
              onClick={handleDisconnectStripe}
              variant={'contained'}
              sx={{ width: 150 }}
              color={'error'}
              disabled={mutation.isLoading}
            >
              Disconnect
              {mutation.isLoading && (
                <CircularProgress
                  sx={{ ml: 1 }}
                  size={20}
                />
              )}
            </Button>
          </Stack>
        ) : (
          <>
            <Button
              sx={{
                p: 0,
              }}
              onClick={handleConnect}
              disabled={stripeAccountMutation.isLoading}
            >
              <StripeConnect />
            </Button>

            <BackdropLoading
              open={stripeAccountMutation.isLoading}
              message="Creating stripe account"
            />
          </>
        )}


        <Button onClick={handleNext}>Skip</Button>
      </Stack>
    </Container>
  );
}
