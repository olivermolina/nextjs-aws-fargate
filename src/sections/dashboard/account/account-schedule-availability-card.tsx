import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import SvgIcon from '@mui/material/SvgIcon';
import Button from '@mui/material/Button';
import InfoIcon from '@mui/icons-material/Info';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import CardActions from '@mui/material/CardActions';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import FormLabel from '@mui/material/FormLabel';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import { AvailabilitySlots } from './account-availability-slots';
import { ChangeEvent, useCallback, useState } from 'react';
import { allTimezones, useTimezoneSelect } from 'react-timezone-select';
import { DAYS_OF_WEEK, useAvailabilitySettings } from '../../../hooks/use-availability-settings';

const timezones = {
  ...allTimezones,
  'Asia/Manila': 'Manila',
  //TODO add more timezones
};

type Props = {
  availabilitySettings: ReturnType<typeof useAvailabilitySettings>;
};

export default function AccountScheduleAvailabilityCard(props: Props) {
  const { availabilitySettings } = props;

  const [currentTab, setCurrentTab] = useState<string>('working-hours');

  const { options, parseTimezone } = useTimezoneSelect({
    labelStyle: 'original',
    timezones,
  });

  const handleTabsChange = useCallback((event: ChangeEvent<any>, value: string): void => {
    setCurrentTab(value);
  }, []);

  const handleSelectDay = (dayOfWeek: number) => {
    availabilitySettings.toggleActiveDay(Number(dayOfWeek));
  };

  return (
    <form onSubmit={availabilitySettings.handleSubmit(availabilitySettings.onSubmit)}>
      <Card
        sx={{
          paddingTop: 0,
          width: '100%', // Use 100% width for full container width
        }}
      >
        <CardHeader
          title={
            <Stack
              direction="row"
              justifyContent="flex-start"
              alignItems="center"
              spacing={2}
            >
              <SvgIcon>
                <EventAvailableIcon />
              </SvgIcon>
              <Typography variant="h6">Availability</Typography>
            </Stack>
          }
          action={
            <Button>
              <Typography
                sx={{
                  color: (theme) => theme.palette.primary.main,
                  textTransform: 'none',
                }}
                variant={'button'}
                onClick={availabilitySettings.toggleEditMode}
              >
                {availabilitySettings.editMode ? 'Cancel' : 'Edit'}
              </Typography>
            </Button>
          }
        />
        <CardContent
          sx={{
            paddingTop: 0,
          }}
        >
          <Stack spacing={4}>
            <Stack spacing={2}>
              <Tabs
                indicatorColor="primary"
                onChange={handleTabsChange}
                scrollButtons="auto"
                textColor="primary"
                value={currentTab}
                variant="scrollable"
              >
                {[
                  {
                    label: 'Working Hours',
                    value: 'working-hours',
                  },
                ].map((tab) => (
                  <Tab
                    key={tab.value}
                    label={tab.label}
                    value={tab.value}
                  />
                ))}
              </Tabs>

              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600 }}
              >
                Timezone
              </Typography>

              <FormControl>
                <FormLabel
                  sx={{
                    color: 'text.primary',
                  }}
                >
                  Primary Timezone
                </FormLabel>
                {availabilitySettings.editMode ? (
                  <Autocomplete
                    getOptionLabel={(option) => option.label}
                    options={options}
                    defaultValue={parseTimezone(availabilitySettings.getValues('timezone'))}
                    onChange={(e, value) => {
                      availabilitySettings.setValue(
                        'timezone',
                        typeof value === 'string'
                          ? value
                          : value?.value || Intl.DateTimeFormat().resolvedOptions().timeZone,
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        variant={'outlined'}
                      />
                    )}
                    sx={{ mt: 2 }} // Add some margin top to separate it from the divider
                  />
                ) : (
                  <Typography sx={{ mt: 1 }}>
                    {
                      parseTimezone(
                        availabilitySettings.getValues('timezone') ||
                        Intl.DateTimeFormat().resolvedOptions().timeZone,
                      ).label
                    }
                  </Typography>
                )}
              </FormControl>
            </Stack>

            <Stack spacing={2}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600 }}
              >
                General availability
              </Typography>
              <Typography variant={'caption'}>
                Set when you&apos;re regularly available. Clients will only be able to book your
                services during available hours.
              </Typography>
              <Stack
                direction={'row'}
                justifyContent="flex-start"
                alignItems="center"
                spacing={2}
                sx={{ backgroundColor: '#ece6fb', p: 1, borderRadius: 0.5 }}
              >
                <InfoIcon color={'primary'} />
                <Typography variant={'caption'}>
                  Your available hours will determine your online booking availability
                </Typography>
              </Stack>

              {availabilitySettings.editMode && (
                <Stack
                  direction={'row'}
                  justifyContent="flex-start"
                  alignItems="center"
                  spacing={2}
                  sx={{ mt: 2 }}
                >
                  {Object.entries(DAYS_OF_WEEK).map(([dayOfWeek, label]) => (
                    <IconButton
                      onClick={() => handleSelectDay(Number(dayOfWeek))}
                      key={dayOfWeek}
                    >
                      <Avatar
                        sx={{
                          bgcolor: (theme) =>
                            availabilitySettings.activeDays.includes(Number(dayOfWeek))
                              ? theme.palette.primary.main
                              : theme.palette.grey[300],
                          color: (theme) => theme.palette.primary.contrastText,
                          width: 24,
                          height: 24,
                        }}
                      >
                        {label.charAt(0)}
                      </Avatar>
                    </IconButton>
                  ))}
                </Stack>
              )}
              <AvailabilitySlots availabilitySettings={availabilitySettings} />
            </Stack>
          </Stack>
        </CardContent>
        {availabilitySettings.editMode && (
          <CardActions>
            <span style={{ flexGrow: 1 }} />
            <Button
              variant={'outlined'}
              onClick={availabilitySettings.handleReset}
              disabled={availabilitySettings.isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type={'submit'}
              variant={'contained'}
              disabled={availabilitySettings.isSubmitting}
            >
              Save
              {availabilitySettings.isSubmitting && (
                <CircularProgress
                  sx={{ ml: 1 }}
                  size={20}
                />
              )}
            </Button>
          </CardActions>
        )}
      </Card>
    </form>
  );
}
