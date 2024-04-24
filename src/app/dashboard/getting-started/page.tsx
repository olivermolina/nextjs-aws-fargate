'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { usePageView } from 'src/hooks/use-page-view';
import BackdropLoading
  from '../../../sections/dashboard/account/account-billing-reactivate-backdrop';
import { useOrganizationStore } from '../../../hooks/use-organization';
import GettingStartedStepper
  from '../../../sections/dashboard/getting-started/getting-started-stepper';
import GettingStartedWatchIntroductionVideo
  from '../../../sections/dashboard/getting-started/getting-started-watch-introduction-video';
import GettingStartedAddPatients
  from '../../../sections/dashboard/getting-started/getting-started-add-patients';
import GettingStartedCreateAppointmentTypes
  from '../../../sections/dashboard/getting-started/getting-started-create-appointment-types';
import GettingStartedSyncCalendars
  from '../../../sections/dashboard/getting-started/getting-started-sync-calendar';
import GettingStartedAcceptOnlinePayments
  from '../../../sections/dashboard/getting-started/getting-started-accept-online-payments';
import { paths } from '../../../paths';
import { useRouter } from '../../../hooks/use-router';
import { useGettingStarted } from '../../../hooks/use-getting-started';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useSearchParams } from '../../../hooks/use-search-params';
import { SplashScreen } from '../../../components/splash-screen';

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepParam = searchParams.get('step');
  const { data: organization } = useOrganizationStore();
  const [activeStep, setActiveStep] = React.useState(0);
  const { gettingStarted, isGettingStartedCompleted, isLoading } = useGettingStarted();
  const handleNext = useCallback(() => {
    router.replace(`${paths.dashboard.gettingStarted}?step=${activeStep + 1}`);
    // Go to dashboard if it's the last step
    if (activeStep === 4) {
      router.push(`${paths.dashboard.index}?skip=getting-started`);
      return;
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  }, [activeStep]);

  const steps = useMemo(
    () => [
      {
        label: 'Watch an introduction video',
        completed: true,
      },
      {
        label: 'Add your clients',
        completed: gettingStarted?.hasPatients || false,
      },
      {
        label: 'Create appointment types',
        completed: gettingStarted?.hasServices || false,
      },
      {
        label: 'Sync other calendars',
        completed: gettingStarted?.hasGoogleCalendar || false,
      },
      {
        label: 'Accept online payments',
        completed: gettingStarted?.hasStripe || false,
      },
    ],
    [gettingStarted],
  );

  const handleSetActiveStep = (step: number) => {
    setActiveStep(step);
    router.replace(`${paths.dashboard.gettingStarted}?step=${step}`);
  };

  usePageView();

  useEffect(() => {
    if (isGettingStartedCompleted) {
      router.replace(paths.dashboard.index);
    }
  }, [isGettingStartedCompleted]);

  useEffect(() => {
    if (stepParam) {
      setActiveStep(parseInt(stepParam));
    }
  }, []);

  if (isLoading || isGettingStartedCompleted) {
    return <SplashScreen />;
  }

  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 2,
        }}
      >
        <Container maxWidth={false}>
          <Stack spacing={4}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'normal',
              }}
            >
              Getting started on Luna Health
            </Typography>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              spacing={2}
            >
              <GettingStartedStepper
                activeStep={activeStep}
                setActiveStep={handleSetActiveStep}
                steps={steps}
              />
              <Card
                sx={{
                  p: 4,
                  width: '100%',
                  minHeight: 600,
                }}
              >
                {activeStep === 0 && <GettingStartedWatchIntroductionVideo />}
                {activeStep === 1 && (
                  <GettingStartedAddPatients
                    handleNext={handleNext}
                    organizationId={organization?.id}
                  />
                )}
                {activeStep === 2 && (
                  <GettingStartedCreateAppointmentTypes handleNext={handleNext} />
                )}
                {activeStep === 3 && (
                  <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
                    <GettingStartedSyncCalendars handleNext={handleNext} />
                  </GoogleOAuthProvider>
                )}
                {activeStep === 4 && <GettingStartedAcceptOnlinePayments handleNext={handleNext} />}
              </Card>
            </Stack>
          </Stack>
        </Container>
      </Box>
      <BackdropLoading
        message={'Sending fax'}
        open={false}
      />
    </>
  );
};

export default Page;
