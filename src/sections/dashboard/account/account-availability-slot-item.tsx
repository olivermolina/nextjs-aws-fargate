import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import dayjs from 'dayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { useMemo } from 'react';
import { useAvailabilitySettings } from '../../../hooks/use-availability-settings';

export const AvailabilitySlotItem = ({
  availabilitySettings,
  dayOfWeek,
}: {
  availabilitySettings: ReturnType<typeof useAvailabilitySettings>;
  dayOfWeek: number;
}) => {
  const dayOfWeekSlots = useMemo(
    () => availabilitySettings.fields.find((field: any) => field.dayOfWeek === Number(dayOfWeek)),
    [dayOfWeek, availabilitySettings]
  );

  if (!dayOfWeekSlots) {
    return (
      <Typography
        variant={'body1'}
        sx={{ color: 'gray' }}
      >
        Unavailable
      </Typography>
    );
  }

  return dayOfWeekSlots?.daySlots.map((daySlot: any, index: number) => (
    <Grid
      container
      direction={'row'}
      spacing={2}
      sx={{ marginBottom: index < dayOfWeekSlots?.daySlots.length - 1 ? 1.5 : 0 }}
      key={daySlot}
    >
      <Grid
        item
        xs={10}
      >
        {availabilitySettings.editMode ? (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack
              spacing={1}
              direction={'row'}
            >
              <TimePicker
                defaultValue={
                  daySlot.start_time
                    ? dayjs(daySlot.start_time)
                    : dayjs().set('hour', 8).set('minute', 0)
                }
                onChange={(date) =>
                  availabilitySettings.handleTimeChange(Number(dayOfWeek), {
                    ...daySlot,
                    start_time: dayjs(date).toDate(),
                  })
                }
                label={'Start'}
              />
              <TimePicker
                defaultValue={
                  daySlot.end_time
                    ? dayjs(daySlot.end_time)
                    : dayjs().set('hour', 17).set('minute', 0)
                }
                onChange={(date) =>
                  availabilitySettings.handleTimeChange(Number(dayOfWeek), {
                    ...daySlot,
                    end_time: dayjs(date).toDate(),
                  })
                }
                label={'End'}
              />
            </Stack>
          </LocalizationProvider>
        ) : (
          <Typography variant="body1">
            <Stack
              spacing={1}
              direction={'row'}
            >
              <span>{dayjs(daySlot.start_time).format('hh:mma') || '9:00am'}</span>
              <span>–</span>
              <span>{dayjs(daySlot.end_time).format('hh:mma') || '5:00pm'}</span>
            </Stack>
          </Typography>
        )}
      </Grid>
      {availabilitySettings.editMode && (
        <Grid
          xs={1}
          item
        >
          {index === 0 ? (
            <IconButton onClick={() => availabilitySettings.handleAddDaySlot(Number(dayOfWeek))}>
              <SvgIcon>
                <AddIcon color={'primary'} />
              </SvgIcon>
            </IconButton>
          ) : (
            <IconButton
              onClick={() =>
                availabilitySettings.handleRemoveDaySlot(Number(dayOfWeek), daySlot.id)
              }
            >
              <SvgIcon>
                <RemoveIcon color={'primary'} />
              </SvgIcon>
            </IconButton>
          )}
        </Grid>
      )}
    </Grid>
  ));
};
