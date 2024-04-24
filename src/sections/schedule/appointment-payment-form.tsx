import * as React from 'react';
import { FC } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { usePatientPaymentMethod } from '../../hooks/use-patient-payment-method';
import SvgIcon from '@mui/material/SvgIcon';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import CircularProgress from '@mui/material/CircularProgress';
import CustomerPaymentMethod from '../dashboard/customer/customer-payment-method';

interface AppointmentPaymentFormProps {
  onBack?: () => void;
  paymentMethod?: ReturnType<typeof usePatientPaymentMethod>;
  submitPaymentAndAppointment: (paymentMethodId: string) => Promise<void>;
  isSubmitting: boolean;
  patientId?: string;
  chargeAmount: number;
  isNewPatient: boolean;
  triggerSubmit: boolean;
  stopTriggerSubmit: (paymentMethodId?: string) => Promise<void>;
}

export const AppointmentPaymentForm: FC<AppointmentPaymentFormProps> = (props) => {
  const {
    onBack,
    paymentMethod,
    isSubmitting,
    submitPaymentAndAppointment,
    patientId,
    chargeAmount,
    isNewPatient,
    triggerSubmit,
    stopTriggerSubmit,
  } = props;


  if (!patientId) {
    return null;
  }

  return (
    <Stack>
      <CustomerPaymentMethod
        customerId={patientId}
        isShowing
        chargeAmount={chargeAmount}
        showTitle={false}
        hideButtons={isNewPatient}
        triggerSubmit={triggerSubmit}
        stopTriggerSubmit={stopTriggerSubmit}
        isSchedulePage={true}
      />
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ mt: 2, p: 2 }}
      >
        <Button
          onClick={onBack}
          color={'primary'}
          variant={'outlined'}
        >
          Back
        </Button>
        <Button
          endIcon={
            <SvgIcon>
              <ArrowRightIcon />
            </SvgIcon>
          }
          variant="contained"
          disabled={isSubmitting}
          onClick={() => submitPaymentAndAppointment(paymentMethod?.data?.id ?? '')}
        >
          Schedule Appointment
          {isSubmitting && (
            <CircularProgress
              sx={{ ml: 1 }}
              size={20}
            />
          )}
        </Button>
      </Stack>
    </Stack>
  );
};
