import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import { AvailabilitySlotItem } from './account-availability-slot-item';
import { DAYS_OF_WEEK, useAvailabilitySettings } from '../../../hooks/use-availability-settings';

export const AvailabilitySlots = ({
  availabilitySettings,
}: {
  availabilitySettings: ReturnType<typeof useAvailabilitySettings>;
}) => {
  return (
    <Stack
      direction="column"
      spacing={2}
    >
      {Object.entries(DAYS_OF_WEEK).map(([dayOfWeek, label]) => (
        <Grid
          key={dayOfWeek}
          container
          spacing={2}
          sx={{
            display: 'flex',
            flexFlow: 'wrap',
          }}
        >
          <Grid
            item
            xs={2}
          >
            <Typography
              variant="body1"
              sx={{ fontWeight: 600 }}
            >
              {label}
            </Typography>
          </Grid>
          <Grid
            item
            xs={10}
          >
            {availabilitySettings.activeDays.includes(Number(dayOfWeek)) ? (
              <AvailabilitySlotItem
                availabilitySettings={availabilitySettings}
                dayOfWeek={Number(dayOfWeek)}
              />
            ) : (
              <Typography
                variant={'body1'}
                sx={{ color: 'gray' }}
              >
                Unavailable
              </Typography>
            )}
          </Grid>
        </Grid>
      ))}
    </Stack>
  );
};
