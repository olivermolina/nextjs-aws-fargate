import * as React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import PaymentMethodForm from 'src/components/payment-method-form';
import { usePatientPaymentMethod } from 'src/hooks/use-patient-payment-method';
import { useDialog } from 'src/hooks/use-dialog';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import ReceiptIcon from '@mui/icons-material/Receipt';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import Button from '@mui/material/Button';

interface AccountPaymentModalProps {
  dialog: ReturnType<typeof useDialog>;
  submitPayNow: (stripePaymentMethodId: string, isNew: boolean) => Promise<void>;
  paymentMethod: ReturnType<typeof usePatientPaymentMethod>;
  isLoading: boolean;
}

export default function AccountPaymentModal(props: AccountPaymentModalProps) {
  const { dialog, submitPayNow, paymentMethod, isLoading } = props;

  return (
    <Dialog open={dialog.open} fullWidth maxWidth="xs" onClose={dialog.handleClose}>
      <Stack
        alignItems="center"
        direction="row"
        spacing={1}
        sx={{
          px: 2,
          py: 1,
        }}
      >
        <SvgIcon>
          <ReceiptIcon />
        </SvgIcon>
        <Typography
          sx={{ flexGrow: 1 }}
          variant="h6"
        >
          Pay Pending Invoice
        </Typography>
        <IconButton onClick={dialog.handleClose}>
          <SvgIcon>
            <XIcon />
          </SvgIcon>
        </IconButton>
      </Stack>
      <DialogContent>
        {!paymentMethod.stripePromise && (
          <div>
            Unable to pay at this time. Please contact support.
          </div>
        )}

        {paymentMethod.stripePromise && paymentMethod.data?.stripe_payment_method && (
          <Stack spacing={2}>
            <Typography variant="body2">
              Credit
              Card: {`${paymentMethod.data.stripe_payment_method?.brand?.toUpperCase()} ending in ${paymentMethod.data.stripe_payment_method?.last4}`}
            </Typography>
            <Button
              variant={'contained'}
              onClick={() => submitPayNow(paymentMethod.data?.stripe_payment_method?.stripe_id!, false)}
            >
              Pay Now
            </Button>
          </Stack>
        )}

        {paymentMethod.stripePromise && !paymentMethod.data && (
          <Elements stripe={paymentMethod.stripePromise}>
            <PaymentMethodForm
              handleSubmit={submitPayNow}
              isLoading={paymentMethod.isLoading || isLoading}
              buttonLabel={'Pay Now'}
            />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
}
