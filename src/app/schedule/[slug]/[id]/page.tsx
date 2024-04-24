'use client';

import { trpc } from 'src/app/_trpc/client';
import { useParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import React, { useCallback, useEffect, useMemo } from 'react';
import { SplashScreen } from 'src/components/splash-screen';
import { getAvailableTimeSlots } from 'src/utils/get-available-time-slots';
import { usePageView } from 'src/hooks/use-page-view';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { green, grey } from '@mui/material/colors';
import { getUserFullName } from 'src/utils/get-user-full-name';
import { User } from 'src/types/user';
import TodayIcon from '@mui/icons-material/Today';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VideocamIcon from '@mui/icons-material/Videocam';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import SvgIcon from '@mui/material/SvgIcon';
import SearchIcon from '@mui/icons-material/Search';
import { allTimezones, useTimezoneSelect } from 'react-timezone-select';
import { IAvailableTimeSlot } from 'src/sections/schedule/appointment-details-step';
import AppointmentTimeSlots from 'src/sections/schedule/appointment-time-slots';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { Status } from '@prisma/client';
import toast from 'react-hot-toast';
import { useDialog } from 'src/hooks/use-dialog';
import { AppointCancelModal } from 'src/sections/schedule/appointment-cancel-modal';
import { OrganizationType } from '../../../../hooks/use-schedule-store';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Image from 'next/image';

dayjs.extend(utc);
dayjs.extend(timezone);

const useConsultation = () => {
  const params = useParams();
  const consultationId = params['id'] as string;
  const scheduleSlug = params['slug'] as string;
  const [isUpdated, setIsUpdated] = React.useState(false);
  const [scheduledTimeSlot, setScheduleTimeSlot] = React.useState<IAvailableTimeSlot | null>(null);

  const dialog = useDialog();
  const [selectedDate, setSelectedDate] = React.useState<Dayjs>(dayjs());

  const mutation = trpc.consultation.update.useMutation();

  const {
    data: consultation,
    isLoading: consultationIsLoading,
    refetch,
  } = trpc.consultation.get.useQuery(
    {
      id: consultationId || '',
    },
    {
      enabled: !!consultationId,
    },
  );

  const { data: providerData } = trpc.user.getUserByUsername.useQuery(
    {
      username: scheduleSlug,
    },
    {
      enabled: !!scheduleSlug,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );

  const { data: organizationData } = trpc.organization.getOrganizationBySlug.useQuery(
    {
      slug: scheduleSlug,
    },
    {
      enabled: !!scheduleSlug,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );

  const organization = useMemo(
    () => (providerData?.organization || organizationData) as unknown as OrganizationType,
    [providerData, organizationData],
  );

  const { data: logoUrl } = trpc.user.getSignedUrlFile.useQuery(
    {
      key: organization?.logo || '',
    },
    {
      enabled: !!organization?.logo,
      refetchOnWindowFocus: false,
    },
  );

  const availabilities = useMemo(() => organization?.Availabilities, [organization]);
  const selectedStaff = useMemo(() => consultation?.staffs?.[0].staff_id, [consultation]);

  const { data, isLoading } = trpc.consultation.getConsultationAvailableSlots.useQuery(
    {
      date: dayjs(selectedDate).toDate(),
      serviceId: consultation?.service_id || '',
      staffId: selectedStaff || '',
      consultationId: consultation?.id || '',
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  const timezone = useMemo(
    () => availabilities?.[0].timezone || dayjs.tz.guess(),
    [availabilities],
  );

  useEffect(() => {
    if (consultation) {
      setScheduleTimeSlot({
        start: dayjs(consultation.start_time).tz(timezone),
        end: dayjs(consultation.end_time).tz(timezone),
      });
      setSelectedDate(dayjs(consultation.start_time).tz(timezone));
    }
  }, [consultation, availabilities, timezone]);

  const availableTimeSlots = useMemo(
    () =>
      data || {
        morning: [] as IAvailableTimeSlot[],
        afternoon: [] as IAvailableTimeSlot[],
      },
    [data, scheduledTimeSlot],
  );

  const timeSlotHasChanged = useMemo(() => {
    if (!consultation) {
      return false;
    }

    const isSameDay = dayjs.tz(consultation.start_time, timezone).isSame(selectedDate, 'day');
    const isSameTime =
      dayjs.tz(consultation.start_time, timezone).format('HH:mm') ===
      scheduledTimeSlot?.start.format('HH:mm');

    return !isSameDay || !isSameTime;
  }, [consultation, selectedDate, scheduledTimeSlot]);

  const handleUpdateAppointment = useCallback(async () => {
    if (!consultation || !scheduledTimeSlot) {
      return;
    }

    try {
      await mutation.mutateAsync({
        id: consultation.id,
        start_time: scheduledTimeSlot.start.format('YYYY-MM-DD HH:mm:ss'),
        end_time: scheduledTimeSlot.end.format('YYYY-MM-DD HH:mm:ss'),
      });
      await refetch();
      setIsUpdated(true);
      toast.success('Appointment updated.');
    } catch (e) {
      toast.error(e.message);
    }
  }, [consultation, scheduledTimeSlot, selectedDate]);

  const handleCancelAppointment = useCallback(async () => {
    if (!consultation || !scheduledTimeSlot) {
      return;
    }

    try {
      await mutation.mutateAsync({
        id: consultation.id,
        status: Status.CANCELED,
      });
      await refetch();
      dialog.handleClose();
      toast.success('Appointment canceled.');
    } catch (e) {
      toast.error(e.message);
    }
  }, [consultation, scheduledTimeSlot, selectedDate]);

  return {
    consultation,
    organization,
    isLoading,
    consultationIsLoading,
    setSelectedDate,
    availabilities,
    selectedDate,
    availableTimeSlots,
    scheduledTimeSlot,
    setScheduleTimeSlot,
    selectedStaff,
    isSubmitting: mutation.isLoading,
    timeSlotHasChanged,
    handleUpdateAppointment,
    handleCancelAppointment,
    dialog,
    isUpdated,
    logoUrl,
  };
};

const timezones = {
  ...allTimezones,
  'Asia/Manila': 'Manila',
};

const Page = () => {
  const {
    consultation,
    organization,
    isLoading,
    consultationIsLoading,
    availabilities,
    setSelectedDate,
    selectedDate,
    availableTimeSlots,
    scheduledTimeSlot,
    setScheduleTimeSlot,
    selectedStaff,
    isSubmitting,
    timeSlotHasChanged,
    handleUpdateAppointment,
    handleCancelAppointment,
    dialog,
    isUpdated,
    logoUrl,
  } = useConsultation();
  const { parseTimezone } = useTimezoneSelect({
    labelStyle: 'original',
    timezones,
  });

  const nowOpenTimeSlot = useMemo(
    () => getAvailableTimeSlots(organization?.Availabilities[0]?.availability_slots || []),
    [organization],
  );

  const shouldDisableDate = useCallback(
    (date: Date | Dayjs) => {
      const availableDays = availabilities
        ?.filter((availability) => availability.user_id === selectedStaff)
        .flatMap(
          (availability) => availability?.availability_slots?.map((slot) => slot.day_of_week),
        );
      return !availableDays?.includes(dayjs(date).get('day'));
    },
    [availabilities, selectedStaff],
  );

  const handleClick = (value: IAvailableTimeSlot) => {
    setScheduleTimeSlot({
      start: dayjs(value.start),
      end: dayjs(value.end),
    });
  };

  const convertedScheduleDate = useMemo(
    () => ({
      start: dayjs(consultation?.start_time).tz(availabilities?.[0].timezone || dayjs.tz.guess()),
      end: dayjs(consultation?.end_time).tz(availabilities?.[0].timezone || dayjs.tz.guess()),
    }),
    [consultation],
  );

  const staffName = getUserFullName(consultation?.staffs?.[0]!.staff as unknown as User);

  usePageView();

  if (consultationIsLoading) {
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
                185 N. Redwood Drive Suite 225, San Rafael, CA 94903
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
            </Paper>
          </Grid>

          <Grid
            xs={12}
            md={8}
            sx={{
              p: {
                xs: 1,
                sm: 2,
                md: 4,
                lg: 6,
              },
            }}
          >
            <Card
              variant="outlined"
              sx={{
                maxWidth: 'lg',
                padding: '32px',
              }}
            >
              <Stack
                spacing={3}
                direction="column"
              >
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                >
                  {consultation?.status === Status.CANCELED ? (
                    <CancelOutlinedIcon
                      sx={{ fontSize: '40px' }}
                      color={'error'}
                    />
                  ) : (
                    <CheckCircleIcon sx={{ color: green[500], fontSize: '40px' }} />
                  )}
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{ fontWeight: 'bold' }}
                    color={consultation?.status === Status.CANCELED ? 'error.main' : 'success.main'}
                  >
                    {consultation?.status === Status.CANCELED
                      ? `Your schedule with ${staffName} is cancelled`
                      : ` You’re booked with ${staffName}`}
                  </Typography>
                </Stack>

                <Typography
                  variant="h6"
                  component="div"
                  sx={{ fontWeight: 'bold', mb: 3, lineHeight: '1.4' }}
                >
                  Details
                </Typography>
                <Stack
                  spacing={1}
                  direction="column"
                  sx={{ mb: 2 }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                  >
                    <TodayIcon sx={{ color: grey[500] }} />
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 'medium', lineHeight: '1.4' }}
                    >
                      {consultation?.description || consultation?.service?.name}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                  >
                    <EventNoteIcon sx={{ color: grey[500] }} />
                    <Typography
                      variant="subtitle1"
                      sx={{ lineHeight: '1.4' }}
                    >
                      {convertedScheduleDate.start.format('dddd - MMM DD, YYYY')}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                  >
                    <AccessTimeIcon sx={{ color: grey[500] }} />
                    <Typography
                      variant="subtitle1"
                      sx={{ lineHeight: '1.4' }}
                    >
                      {convertedScheduleDate.start.format('hh:mm A')} -{' '}
                      {convertedScheduleDate.end.format('hh:mm A')}
                    </Typography>
                  </Stack>
                  {consultation?.telemedicine && (
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={2}
                    >
                      <VideocamIcon sx={{ color: grey[500] }} />
                      <Typography
                        variant="subtitle1"
                        sx={{ lineHeight: '1.4' }}
                      >
                        Video Call
                      </Typography>
                    </Stack>
                  )}

                  {consultation?.location && (
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={2}
                    >
                      <LocationOnIcon sx={{ color: grey[500] }} />
                      <Typography
                        variant="subtitle1"
                        sx={{ lineHeight: '1.4' }}
                      >
                        {consultation?.location?.value}
                      </Typography>
                    </Stack>
                  )}
                </Stack>

                {!isUpdated &&
                  (consultation?.status === Status.CONFIRMED ||
                    consultation?.status === Status.PENDING) && (
                    <>
                      <Stack
                        spacing={1}
                        direction={{
                          xs: 'column',
                          lg: 'row',
                        }}
                        alignItems={'stretch'}
                        justifyContent={{
                          xs: 'space-between',
                          lg: 'stretch',
                        }}
                        component={Paper}
                        sx={{
                          p: 2,
                        }}
                      >
                        <Stack alignItems={'center'}>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateCalendar
                              value={selectedDate}
                              onChange={(newValue) => setSelectedDate(newValue || dayjs())}
                              sx={{
                                height: 288,
                              }}
                              disablePast
                              shouldDisableDate={shouldDisableDate}
                            />
                          </LocalizationProvider>
                        </Stack>
                        <Stack
                          alignItems={'center'}
                          direction={{
                            sm: 'column',
                            lg: 'row',
                          }}
                          sx={() => ({
                            flexGrow: 1,
                          })}
                        >
                          <Box
                            sx={(theme) => ({
                              width: 0,
                              height: 0,
                              borderLeft: '25px solid transparent',
                              borderRight: '25px solid transparent',
                              borderBottom: '25px solid #e8eef9',
                              [theme.breakpoints.up('lg')]: {
                                width: 0,
                                height: 0,
                                borderTop: '25px solid transparent',
                                borderBottom: '25px solid transparent',
                                borderRight: '25px solid #e8eef9',
                              },
                            })}
                          />
                          <Stack
                            spacing={2}
                            sx={{
                              backgroundColor: '#e8eef9',
                              p: { xs: 2, lg: 4 },
                              flexGrow: 1,
                              borderRadius: 0.5,
                              height: '100%',
                              width: '100%',
                            }}
                            justifyContent={'justify-start'}
                            alignItems={'center'}
                          >
                            <Typography variant={'h6'}>
                              {dayjs(selectedDate).format('MMMM DD, YYYY')}
                            </Typography>
                            <Typography variant={'caption'}>
                              Timezone:{' '}
                              {
                                parseTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
                                  .label
                              }
                            </Typography>

                            {isLoading ? (
                              <>
                                <SvgIcon>
                                  <SearchIcon fontSize={'large'} />
                                </SvgIcon>
                                <Typography>Searching for available sessions...</Typography>
                              </>
                            ) : (
                              <AppointmentTimeSlots
                                availableTimeSlots={availableTimeSlots}
                                scheduleTimeSlot={scheduledTimeSlot}
                                handleClick={handleClick}
                              />
                            )}
                          </Stack>
                        </Stack>
                      </Stack>

                      <Stack
                        direction="row"
                        justifyContent="flex-end"
                        sx={{ mt: 2 }}
                        spacing={2}
                      >
                        <Button
                          variant="contained"
                          disabled={isSubmitting}
                          onClick={dialog.handleOpen}
                          color={'error'}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          disabled={isSubmitting || !timeSlotHasChanged}
                          onClick={handleUpdateAppointment}
                        >
                          Change{' '}
                          {isSubmitting && !dialog.open && (
                            <CircularProgress
                              sx={{ ml: 1 }}
                              size={20}
                            />
                          )}
                        </Button>
                      </Stack>
                    </>
                  )}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Box>
      <AppointCancelModal
        {...dialog}
        handleSubmit={handleCancelAppointment}
        isSubmitting={isSubmitting}
        onClose={dialog.handleClose}
      />
    </>
  );
};
export default Page;
