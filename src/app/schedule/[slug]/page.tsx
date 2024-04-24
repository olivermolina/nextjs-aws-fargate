'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import { usePageView } from 'src/hooks/use-page-view';
import {
  AvailabilityWithSlots,
  JobCreateForm,
} from 'src/sections/schedule/appointment-create-form';
import React, { useMemo } from 'react';
import { SplashScreen } from 'src/components/splash-screen';
import { getUserFullName } from 'src/utils/get-user-full-name';
import { User } from 'src/types/user';
import { getAvailableTimeSlots } from 'src/utils/get-available-time-slots';
import { useScheduleStore } from 'src/hooks/use-schedule-store';
import BackdropLoading
  from '../../../sections/dashboard/account/account-billing-reactivate-backdrop';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { addressToString } from '../../../utils/address-to-string';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VideocamIcon from '@mui/icons-material/Videocam';
import SvgIcon from '@mui/material/SvgIcon';
import { grey } from '@mui/material/colors';
import Image from 'next/image';

const Page = () => {
  usePageView();

  const {
    organization,
    isLoading,
    setSelectedStaff,
    selectedStaff,
    selectedService,
    setSelectedService,
    selectedDate,
    setSelectedDate,
    consultation,
    setScheduleTimeSlot,
    scheduleTimeSlot,
    scheduleActiveStep,
    setScheduleActiveStep,
    paymentMethod,
    submitAppointment,
    submitPaymentAndAppointment,
    user,
    createConsultationMutation,
    payAppointmentMutation,
    createUserMutation,
    chargeAmount,
    isNewPatient,
    triggerSubmit,
    stopTriggerSubmit,
    locations,
    selectedLocationId,
    handleLocationChange,
    logoUrl,
    serviceOptions,
  } = useScheduleStore();

  const nowOpenTimeSlot = useMemo(
    () => getAvailableTimeSlots(organization?.Availabilities?.[0]?.availability_slots || []),
    [organization],
  );

  const backdropLoadingMessage = useMemo(() => {
    if (createConsultationMutation.isLoading) {
      return 'Creating appointment';
    }

    if (payAppointmentMutation.isLoading || triggerSubmit) {
      return 'Processing payment';
    }

    if (createUserMutation.isLoading) {
      return 'Creating user';
    }

    return 'Loading';
  }, [createConsultationMutation, payAppointmentMutation, createUserMutation, triggerSubmit]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <>
      <Box
        component="main"
        sx={{
          display: 'flex',
          flexGrow: 1,
        }}
      >
        <Grid
          container
          sx={{ flexGrow: 1 }}
        >
          <Grid
            xs={12}
            md={4}
            sx={{
              p: {
                xs: 1,
                sm: 2,
                md: 4,
                lg: 6,
              },
            }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'center', // This will center the paper content vertically
              }}
            >
              {logoUrl && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Image
                    src={logoUrl}
                    alt={organization?.name}
                    height={200}
                    width={200}
                  />
                </Box>
              )}
              <Typography
                variant="h5"
                gutterBottom
                align="center"
              >
                {organization?.name}
              </Typography>
              <Typography
                variant="body1"
                align="center"
              >
                {selectedLocationId
                  ? locations?.find((location) => location.id === selectedLocationId)?.value
                  : addressToString(organization?.address)}
              </Typography>
              <Typography
                variant="body1"
                align="center"
                gutterBottom
              >
                {organization?.email} | {organization?.phone}
              </Typography>
              <Typography
                variant="body2"
                align="center"
                sx={{ mb: 2 }}
              >
                {nowOpenTimeSlot.from && nowOpenTimeSlot.to
                  ? `Open today ${nowOpenTimeSlot.from} — ${nowOpenTimeSlot.to}`
                  : 'Closed today'}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography
                variant="body1"
                align="center"
              >
                {organization?.description}
              </Typography>
              <Divider sx={{ my: 2 }} />
              {!consultation && (
                <>
                  {/* Select Dr. */}
                  <Autocomplete
                    getOptionLabel={(option) => getUserFullName(option)}
                    options={(organization?.users as User[]) || []}
                    defaultValue={
                      organization?.users.find((user) => user.id === selectedStaff) ||
                      organization?.Availabilities?.[0]?.user ||
                      organization?.users[0]
                    }
                    onChange={(event, newValue) => {
                      if (newValue) {
                        setSelectedStaff(newValue.id);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        label="Select Provider"
                        name="provider"
                      />
                    )}
                    sx={{ my: 2 }} // Add some margin top to separate it from the divider
                  />

                  {/* Location component goes here */}
                  {locations && locations.length > 0 && (
                    <FormControl fullWidth>
                      <InputLabel id="select-location-label">Select Appointment Type</InputLabel>
                      <Select
                        labelId="select-location-label"
                        fullWidth
                        label="Select Appointment Type"
                        name="location"
                        value={selectedLocationId || ''}
                        onChange={handleLocationChange}
                      >
                        <MenuItem value={'telemedicine'}>
                          <Stack
                            direction={'row'}
                            spacing={1}
                            justifyContent={'flex-start'}
                            alignItems={'center'}
                          >
                            <SvgIcon>
                              <VideocamIcon sx={{ color: grey[500] }} />
                            </SvgIcon>
                            <Typography>Telemedicine</Typography>
                          </Stack>
                        </MenuItem>
                        {locations?.map((location) => (
                          <MenuItem
                            key={location.id}
                            value={location.id}
                          >
                            <Stack
                              direction={'row'}
                              spacing={1}
                              justifyContent={'flex-start'}
                              alignItems={'center'}
                            >
                              <SvgIcon>
                                <LocationOnIcon sx={{ color: grey[500] }} />
                              </SvgIcon>
                              <Typography>{location.display_name}</Typography>
                              <Typography
                                variant={'caption'}
                                color={'text.secondary'}
                                sx={{
                                  fontStyle: 'italic',
                                }}
                              >
                                in-person
                              </Typography>
                            </Stack>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </>
              )}
            </Paper>
          </Grid>
          <Grid
            xs={12}
            md={8}
            sx={{
              p: {
                xs: 2,
                sm: 4,
                md: 8,
              },
            }}
          >
            <Stack spacing={3}>
              <Typography
                id="schedule-title"
                variant="h4"
              >
                Schedule your appointment
              </Typography>
              <JobCreateForm
                selectedStaff={selectedStaff}
                setSelectedStaff={setSelectedStaff}
                selectedService={selectedService}
                setSelectedService={setSelectedService}
                services={serviceOptions}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                availabilities={(organization?.Availabilities as AvailabilityWithSlots[]) || []}
                organizationId={organization?.id || ''}
                consultation={consultation}
                submitAppointment={submitAppointment}
                setScheduleTimeSlot={setScheduleTimeSlot}
                scheduleTimeSlot={scheduleTimeSlot}
                scheduleActiveStep={scheduleActiveStep}
                setScheduleActiveStep={setScheduleActiveStep}
                paymentRequired={organization?.appointment_payment_required}
                paymentMethod={paymentMethod}
                submitPaymentAndAppointment={submitPaymentAndAppointment}
                patientId={user?.id}
                chargeAmount={chargeAmount}
                isNewPatient={isNewPatient}
                triggerSubmit={triggerSubmit}
                stopTriggerSubmit={stopTriggerSubmit}
              />
            </Stack>
          </Grid>
        </Grid>
      </Box>
      <BackdropLoading
        open={
          createConsultationMutation.isLoading ||
          payAppointmentMutation.isLoading ||
          createUserMutation.isLoading ||
          triggerSubmit
        }
        message={backdropLoadingMessage}
      />
    </>
  );
};

export default Page;
