import React, { FC, useCallback, useState } from 'react';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PatientInput, PatientValidationSchema } from 'src/types/patient';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import CircularProgress from '@mui/material/CircularProgress';
import AppointmentLoginModal from './appointment-login-modal';

type JobDescriptionStepProps = {
  submitAppointment: (
    patient: PatientInput,
    paymentRequired: boolean,
    callback?: () => void,
  ) => Promise<void>;
  organizationId: string;
  onBack: () => void;
  paymentRequired: boolean;
  onNext?: () => void;
};

export const JobDescriptionStep: FC<JobDescriptionStepProps> = (props) => {
  const { onBack, submitAppointment, paymentRequired, onNext } = props;
  const [openLogin, setOpenLogin] = useState(false);

  const [selectedDate, setSelectedDate] = useState(dayjs());
  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
    setValue,
  } = useForm<PatientInput>({
    mode: 'onChange',
    resetOptions: {
      keepIsSubmitted: false,
    },
    reValidateMode: 'onSubmit',
    resolver: zodResolver(PatientValidationSchema),
  });

  const onSubmit = useCallback(
    async (data: PatientInput) => {
      await submitAppointment(data, paymentRequired, onNext);
    },
    [paymentRequired],
  );

  return (
    <>
      <Stack spacing={3}>
        <Card sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, mt: 2 }}
                gutterBottom
              >
                Have an account?
              </Typography>
              <Button
                variant="contained"
                sx={{ mb: 2 }}
                onClick={() => setOpenLogin(true)}
              >
                Login here
              </Button>
              <Divider sx={{ mb: 2, mt: 2 }} /> {/* Divider with a margin */}
              <Typography
                variant="h5"
                sx={{ mb: 2, mt: 2 }}
              >
                Continue as Guest
              </Typography>
            </Box>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="First Name"
                  {...register('first_name')}
                  error={!!errors.first_name}
                  helperText={errors.first_name?.message}
                />

                <TextField
                  fullWidth
                  label="Last Name"
                  {...register('last_name')}
                  error={!!errors.last_name}
                  helperText={errors.last_name?.message}
                />

                <TextField
                  fullWidth
                  label="Phone Number"
                  {...register('phone')}
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                />

                <TextField
                  fullWidth
                  label="Email"
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={selectedDate}
                    label="Birth date"
                    onChange={(newValue) => {
                      const newDate = newValue ?? dayjs();
                      setSelectedDate(newDate);
                      setValue('birthdate', newDate.toDate());
                    }}
                  />
                </LocalizationProvider>

                <TextField
                  fullWidth
                  label="Reason for Appointment"
                  placeholder="Anything you want to share?"
                  multiline
                  rows={3}
                  variant="outlined"
                  {...register('patient_notes')}
                />
              </Stack>

              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ mt: 2 }}
              >
                <Button
                  onClick={onBack}
                  color={'primary'}
                  variant={'outlined'}
                >
                  Back
                </Button>
                <Button
                  type={'submit'}
                  endIcon={
                    <SvgIcon>
                      <ArrowRightIcon />
                    </SvgIcon>
                  }
                  variant="contained"
                  disabled={isSubmitting}
                >
                  {paymentRequired ? 'Next' : 'Schedule Appointment'}
                  {isSubmitting && (
                    <CircularProgress
                      sx={{ ml: 1 }}
                      size={20}
                    />
                  )}
                </Button>
              </Stack>
            </form>
          </Stack>
        </Card>
      </Stack>

      <AppointmentLoginModal
        open={openLogin}
        handleClose={() => setOpenLogin(false)}
      />
    </>
  );
};
