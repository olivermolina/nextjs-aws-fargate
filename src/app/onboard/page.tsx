'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import Divider from '@mui/material/Divider';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { trpc } from '../_trpc/client';
import React, { useCallback, useEffect, useState } from 'react';
import { Gender, UserType } from '@prisma/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { SplashScreen } from '../../components/splash-screen';
import { OnboardForm, OnboardPatientInput } from '../../sections/onboard/onboard-form';
import toast from 'react-hot-toast';
import { paths } from '../../paths';
import { getUserFullName } from '../../utils/get-user-full-name';
import { useAuth } from '../../hooks/use-auth';
import { AuthContextType } from '../../contexts/auth/jwt';
import { AuthUser } from '../../contexts/auth/jwt/auth-context';
import { useTimezone } from '../../hooks/use-timezone';
import { useStytchB2BClient } from '@stytch/nextjs/b2b';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import { OnboardIntakeConsent } from '../../sections/onboard/onboard-intake-consent';

const list = [
  'Manage appointments with your practitioner',
  'Access your documentation & lab results',
  'Schedule and manage your appointments',
  'Communicate with your practitioner',
];

const steps = ['Your Details', 'Consent Form'];

const Page = () => {
  const { setAuthUser, user } = useAuth<AuthContextType>();
  const router = useRouter();
  const stytch = useStytchB2BClient();
  const searchParams = useSearchParams();

  const [signature, setSignature] = useState<string | undefined>(undefined);

  const handleSetSignature = (newSignature: string | undefined) => {
    setSignature(newSignature);
  };

  const token = searchParams.get('token');
  const {
    data: patient,
    isLoading,
    error,
  } = trpc.user.getUserByToken.useQuery(
    {
      token: token!,
    },
    {
      enabled: !!token,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );
  const { data: intakeTemplates } = trpc.template.listByOrganizationId.useQuery(
    {
      organizationId: patient?.organization_id || '',
      tags: ['Intake'],
    },
    {
      enabled: !!patient?.organization_id,
    }
  );

  const [formData, setFormData] = useState<OnboardPatientInput | undefined>(undefined);

  const [activeStep, setActiveStep] = useState(0);
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const timezone = useTimezone();
  const mutation = trpc.user.patientOnboard.useMutation();

  const onSubmit = (inputs: OnboardPatientInput) => {
    setFormData(inputs);
    handleNext();
  };

  const handleSavePatient = useCallback(async () => {
    if (!formData) {
      toast.error('Please fill out the form');
      return;
    }

    if (!signature) {
      toast.error('Please sign the consent form');
      return;
    }

    try {
      const result = await mutation.mutateAsync({
        ...formData,
        type: UserType.PATIENT,
        address: {
          address_line1: formData.address_line1,
          address_line2: formData.address_line2,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          country: formData.country,
        },
        active: true,
        timezone: timezone.value,
        signature,
        intakes: intakeTemplates?.map((template) => template.id),
      });
      if (result) {
        await stytch.passwords.authenticate({
          organization_id: result.organization.stytch_id,
          email_address: formData.email,
          password: formData.password,
          session_duration_minutes: 60,
        });
        await setAuthUser(result as AuthUser);
        router.push(paths.dashboard.index);
        toast.success('Welcome to Luna!');
      }
    } catch (e) {
      toast.error(e.error_message || e.message);
    }
  }, [formData, signature, intakeTemplates]);

  usePageView();

  useEffect(() => {
    // Reset form when patient changes
    if (patient) {
      setFormData({
        id: patient?.id || '',
        first_name: patient?.first_name || '',
        last_name: patient?.last_name || '',
        email: patient?.email || '',
        phone: patient?.phone || '',
        gender: Gender.OTHER,
        birthdate: new Date(),
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        confirmPassword: '',
        password: '',
      });
    }
  }, [patient]);

  useEffect(() => {
    if (!patient && !isLoading) {
      router.replace(paths.login);
      return;
    }

    if (patient && patient.type === UserType.PATIENT && patient.active) {
      router.replace(paths.dashboard.index);
      return;
    }
  }, [router, patient]);

  if (!token && user) {
    router.replace(paths.login);
    return;
  }

  if (isLoading) return <SplashScreen />;

  if (error) {
    return (
      <>
        <Seo title="Contact" />
        <Box component="main">
          <Box
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.50',
              py: 8,
            }}
          >
            <Container
              maxWidth="md"
              sx={{ pl: { lg: 15 } }}
            >
              <Stack spacing={3}>
                <Typography sx={{ textAlign: 'center', fontSize: 38 }}>
                  {error.shape?.message}
                </Typography>
                <Button
                  variant={'contained'}
                  href={paths.login}
                >
                  Login
                </Button>
              </Stack>
            </Container>
          </Box>
        </Box>
      </>
    );
  }

  return (
    <>
      <Seo title="Contact" />
      <Box
        component="main"
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            lg: 'repeat(2, 1fr)',
            xs: 'repeat(1, 1fr)',
          },
          flexGrow: 1,
        }}
      >
        <Box
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.50',
            py: 8,
          }}
        >
          <Container
            maxWidth="md"
            sx={{ pl: { lg: 15 } }}
          >
            <Stack spacing={3}>
              <Typography sx={{ textAlign: 'center', fontSize: 38 }}>
                <strong>{getUserFullName(patient?.staffs?.[0]?.staff)}</strong> has invited you to
                join their Luna platform
              </Typography>
            </Stack>
            <Divider
              sx={{ mt: 4 }}
              light={true}
            />
            <Stack
              alignItems="center"
              direction="column"
              spacing={4}
              sx={{
                mb: 6,
                mt: 8,
              }}
            >
              {list.map((item) => (
                <Stack
                  key={item}
                  direction={'row'}
                  spacing={4}
                >
                  <CheckCircleIcon color={'info'} />
                  <Typography sx={{ minWidth: '335px' }}>{item}</Typography>
                </Stack>
              ))}
            </Stack>
          </Container>
        </Box>
        <Box
          sx={{
            backgroundColor: 'background.paper',
            px: 6,
            py: 15,
          }}
        >
          <Container
            maxWidth="md"
            sx={{
              pr: {
                lg: 15,
              },
            }}
          >
            <Stack spacing={4}>
              <Stepper activeStep={activeStep}>
                {steps.map((label) => {
                  return (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  );
                })}
              </Stepper>

              {activeStep === 0 && (
                <OnboardForm
                  defaultValues={formData}
                  onSubmit={onSubmit}
                  isLoading={mutation.isLoading}
                />
              )}

              {activeStep === 1 && (
                <OnboardIntakeConsent
                  clinicName={patient?.organization.name || ''}
                  consentTemplates={intakeTemplates || []}
                  handleBack={handleBack}
                  handleNext={handleSavePatient}
                  isLoading={mutation.isLoading}
                  handleSetSignature={handleSetSignature}
                />
              )}
            </Stack>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default Page;
