import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import CustomerImport from '../customer/customer-import-modal';
import BackdropLoading from '../account/account-billing-reactivate-backdrop';
import React from 'react';
import { useImportPatients } from '../../../hooks/user-import-patients';
import { useInvite } from '../../../hooks/use-invite-patient';
import { CustomerWelcomeEmailDialog } from '../customer/customer-welcome-email-dialog';
import { trpc } from '../../../app/_trpc/client';
import { useForm } from 'react-hook-form';
import { PatientInput, PatientValidationSchema } from '../../../types/patient';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import FormHelperText from '@mui/material/FormHelperText';
import { UserType } from '@prisma/client';
import moment from 'moment-timezone';

type GettingStartedAddClientsProps = {
  handleNext: () => void;
  organizationId?: string;
};

export default function GettingStartedAddPatients({
                                                    handleNext,
                                                    organizationId,
                                                  }: GettingStartedAddClientsProps) {
  const importPatients = useImportPatients(handleNext);
  const inviteToPortal = useInvite();
  const mutation = trpc.user.create.useMutation();
  const {
    formState: { errors },
    register,
    handleSubmit,
    clearErrors,
    reset,
  } = useForm<PatientInput>({
    resolver: zodResolver(PatientValidationSchema),
    mode: 'onSubmit',
    shouldFocusError: true,
    shouldUseNativeValidation: false,
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
    },
  });

  const onSubmit = async (data: PatientInput) => {
    try {
      await mutation.mutate({
        ...data,
        type: UserType.PATIENT,
        timezone: moment.tz.guess(),
        organization_id: organizationId || '',
      });
      inviteToPortal.handleOpenInvite();
      clearErrors();
      reset({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
      });
      toast.success('Patient created successfully');
    } catch (e) {
      toast.error('Failed to create patient');
    }
  };

  return (
    <>
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
            It all starts with patients
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 'normal',
              pb: 2,
            }}
          >
            Get yourself up and running with patients for future appointments, notes, and payments
          </Typography>

          <Button
            variant={'outlined'}
            sx={{
              width: 250,
            }}
            onClick={() => {
              importPatients.importDialog.handleOpen();
              clearErrors();
            }}
          >
            Import Patients
          </Button>
          <Divider
            sx={{
              width: '100%',
            }}
          >
            or
          </Divider>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid
              container
              spacing={1}
              sx={{
                maxWidth: 600,
              }}
            >
              <Grid
                xs={12}
                sm={6}
                item
              >
                <FormControl
                  fullWidth
                  error={!!errors?.first_name}
                >
                  <FormLabel
                    sx={{
                      color: 'text.primary',
                      mb: 1,
                    }}
                  >
                    First Name *
                  </FormLabel>
                  <OutlinedInput {...register('first_name')} />
                  {errors.first_name?.message && (
                    <FormHelperText error>{errors.first_name?.message}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid
                xs={12}
                sm={6}
                item
              >
                <FormControl
                  fullWidth
                  error={!!errors?.last_name}
                >
                  <FormLabel
                    sx={{
                      color: 'text.primary',
                      mb: 1,
                    }}
                  >
                    Last Name *
                  </FormLabel>
                  <OutlinedInput {...register('last_name')} />

                  {errors.last_name?.message && (
                    <FormHelperText error>{errors.last_name?.message}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid
                xs={12}
                sm={6}
                item
              >
                <FormControl
                  fullWidth
                  error={!!errors?.email}
                >
                  <FormLabel
                    sx={{
                      color: 'text.primary',
                      mb: 1,
                    }}
                  >
                    Email *
                  </FormLabel>
                  <OutlinedInput {...register('email')} />
                  {errors.email?.message && (
                    <FormHelperText error>{errors.email?.message}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid
                xs={12}
                sm={6}
                item
              >
                <FormControl fullWidth>
                  <FormLabel
                    sx={{
                      color: 'text.primary',
                      mb: 1,
                    }}
                  >
                    Phone number
                  </FormLabel>
                  <OutlinedInput {...register('phone')} />
                </FormControl>
              </Grid>
              <Grid
                item
                xs={12}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 2,
                }}
              >
                <Button
                  type={'submit'}
                  variant={'contained'}
                  sx={{
                    width: 150,
                  }}
                  disabled={mutation.isLoading}
                >
                  Create Client
                </Button>
              </Grid>
            </Grid>
          </form>

          <Button onClick={handleNext}>Skip</Button>
        </Stack>
      </Container>
      {mutation.data && (
        <CustomerWelcomeEmailDialog
          {...inviteToPortal}
          handleClose={() => {
            inviteToPortal.handleClose();
            handleNext();
          }}
          patient={mutation.data}
        />
      )}
      <CustomerImport
        open={importPatients.importDialog.open}
        handleClose={importPatients.importDialog.handleClose}
        handleImport={importPatients.handleImport}
      />
      <BackdropLoading
        open={importPatients.isLoading || mutation.isLoading}
        message={importPatients.isLoading ? 'Importing customers...' : 'Creating patient...'}
      />
    </>
  );
}
