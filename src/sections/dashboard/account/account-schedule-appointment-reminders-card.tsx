import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import { useAppointmentSettings } from '../../../hooks/use-appointment-settings';
import NotificationsIcon from '@mui/icons-material/Notifications';

type Props = {
  appointmentSettings: ReturnType<typeof useAppointmentSettings>;
};

export default function AccountScheduleAppointmentRemindersCard(
  props: Props,
) {
  const { appointmentSettings } = props;
  return (
    <Card
      sx={{
        width: '100%', // Set to full width to match the previous card
      }}
    >
      <CardHeader
        title={
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
          >
            <NotificationsIcon />
            <Typography variant="h6">Reminders</Typography>
          </Stack>
        }
      />
      <CardContent>
        <Grid
          container
          spacing={3}
          alignItems="center"
        >
          <Grid
            item
            xs={12}
            md={3}
          >
            <Typography variant="subtitle1">24 hours before</Typography>
          </Grid>
          <Grid
            item
            xs={6}
            md={4}
          >
            <Typography color="text.secondary">Email Notification</Typography>
            <Switch
              checked={appointmentSettings.state.reminders_day_before}
              onChange={appointmentSettings.onChange}
              name={'reminders_day_before'}
            />
          </Grid>
          <Grid
            item
            xs={6}
            md={4}
          >
            <Typography color="text.secondary">SMS Notification</Typography>
            <Switch
              checked={appointmentSettings.state.sms_reminders_day_before}
              onChange={appointmentSettings.onChange}
              name={'sms_reminders_day_before'}
            />
          </Grid>
          <Divider sx={{ my: 3, width: '100%' }} />
          <Grid
            item
            xs={12}
            md={3}
          >
            <Typography variant="subtitle1">An hour before</Typography>
          </Grid>
          <Grid
            item
            xs={6}
            md={4}
          >
            <Typography color="text.secondary">Email Notification</Typography>
            <Switch
              checked={appointmentSettings.state.reminders_hour_before}
              onChange={appointmentSettings.onChange}
              name={'reminders_hour_before'}
            />
          </Grid>
          <Grid
            item
            xs={6}
            md={4}
          >
            <Typography color="text.secondary">SMS Notification</Typography>

            <Switch
              checked={appointmentSettings.state.sms_reminders_hour_before}
              onChange={appointmentSettings.onChange}
              name={'sms_reminders_hour_before'}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
