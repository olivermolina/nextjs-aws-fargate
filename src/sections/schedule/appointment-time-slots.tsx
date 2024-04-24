import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import dayjs from 'dayjs';
import { TimeSlot } from './appointment-create-form';
import { useAvailableTimeSlots } from './appointment-details-step';

interface AppointmentTimeSlotsProps {
  availableTimeSlots: ReturnType<typeof useAvailableTimeSlots>['availableTimeSlots'];
  scheduleTimeSlot: TimeSlot | null;
  handleClick: any;
}

export default function AppointmentTimeSlots({
  availableTimeSlots,
  scheduleTimeSlot,
  handleClick,
}: AppointmentTimeSlotsProps) {
  if (availableTimeSlots.afternoon.length === 0 && availableTimeSlots.morning.length === 0) {
    return (
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        justifyContent="center"
        sx={{
          height: '100%',
        }}
      >
        <Typography variant="h6">No available time slots</Typography>
      </Stack>
    );
  }

  return Object.entries(availableTimeSlots).map(([period, timeSlots]) => {
    if (timeSlots.length === 0) {
      return null;
    }

    return (
      <Grid
        key={period}
        container
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <Grid
          item
          xs={2}
        >
          <Typography
            sx={{
              textTransform: 'capitalize',
              fontWeight: 600,
            }}
            variant={'body1'}
          >
            {period}
          </Typography>
        </Grid>
        <Grid
          item
          xs={8}
        >
          <Stack
            direction="row"
            spacing={1}
            maxWidth="xs"
            useFlexGap
            flexWrap="wrap"
            justifyContent={'justify-start'}
          >
            {timeSlots?.map((value) => (
              <Chip
                key={dayjs(value.start).format('hh:mm A')}
                color={
                  scheduleTimeSlot?.start.format('hh:mm A') === dayjs(value.start).format('hh:mm A')
                    ? 'primary'
                    : 'default'
                }
                label={dayjs(value.start).format('hh:mm A')}
                onClick={() => handleClick(value)}
              />
            ))}
          </Stack>
        </Grid>
      </Grid>
    );
  });
}
