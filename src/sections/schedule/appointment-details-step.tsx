import type { FC } from 'react';
import { useCallback } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import dayjs, { Dayjs } from 'dayjs';
import { allTimezones, useTimezoneSelect } from 'react-timezone-select';
import { Service } from '@prisma/client';
import { trpc } from 'src/app/_trpc/client';
import SearchIcon from '@mui/icons-material/Search';
import SvgIcon from '@mui/material/SvgIcon';
import { AvailabilityWithSlots, TimeSlot } from './appointment-create-form';
import AppointmentTimeSlots from './appointment-time-slots';

interface JobDetailsStepProps {
  onNext?: () => void;
  onBack?: () => void;
  selectedDate: Date | Dayjs;
  setSelectedDate: any;
  availabilities: AvailabilityWithSlots[];
  services: Service[];
  selectedService: string | null;
  selectedStaff: string | null;
  setScheduleTimeSlot: any;
  scheduleTimeSlot: TimeSlot | null;
}

const timezones = {
  ...allTimezones,
  'Asia/Manila': 'Manila',
};

export interface IAvailableTimeSlot {
  start: Dayjs;
  end: Dayjs;
}

export const useAvailableTimeSlots = (
  selectedDate: Date | Dayjs,
  selectedService: string | null,
  selectedStaff: string | null
) => {
  const { data, isLoading } = trpc.consultation.getConsultationAvailableSlots.useQuery(
    {
      date: dayjs(selectedDate).toDate(),
      serviceId: selectedService || '',
      staffId: selectedStaff || '',
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  return {
    availableTimeSlots: data || {
      morning: [] as IAvailableTimeSlot[],
      afternoon: [] as IAvailableTimeSlot[],
    },
    isLoading,
  };
};

export const JobDetailsStep: FC<JobDetailsStepProps> = (props) => {
  const {
    onBack,
    onNext,
    selectedDate,
    setSelectedDate,
    availabilities,
    selectedService,
    selectedStaff,
    setScheduleTimeSlot,
    scheduleTimeSlot,
  } = props;
  const { parseTimezone } = useTimezoneSelect({
    labelStyle: 'original',
    timezones,
  });

  const { availableTimeSlots, isLoading } = useAvailableTimeSlots(
    selectedDate,
    selectedService,
    selectedStaff
  );

  const handleClick = (value: IAvailableTimeSlot) => {
    setScheduleTimeSlot({
      start: dayjs(value.start),
      end: dayjs(value.end),
    });
    onNext?.();
  };

  const shouldDisableDate = useCallback(
    (date: Date | Dayjs) => {
      const availableDays = availabilities
        ?.filter((availability) => availability.user_id === selectedStaff)
        .flatMap((availability) => availability.availability_slots.map((slot) => slot.day_of_week));
      return !availableDays.includes(dayjs(date).get('day'));
    },
    [availabilities, selectedStaff]
  );

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h6">Pick when you would like your appointment </Typography>
      </div>
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
        maxWidth="md"
      >
        <Stack alignItems={'center'}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
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
            <Typography variant={'h6'}>{dayjs(selectedDate).format('MMMM DD, YYYY')}</Typography>
            <Typography variant={'caption'}>
              Timezone: {parseTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone).label}
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
                scheduleTimeSlot={scheduleTimeSlot}
                handleClick={handleClick}
              />
            )}
          </Stack>
        </Stack>
      </Stack>

      <Stack
        alignItems="center"
        direction="row"
        spacing={2}
        style={{
          marginTop: '50px',
        }}
      >
        <Button
          color="primary"
          onClick={onBack}
          variant={'outlined'}
        >
          Back
        </Button>
      </Stack>
    </Stack>
  );
};
