import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import PaymentIcon from '@mui/icons-material/Payment';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import { useAppointmentSettings } from '../../../hooks/use-appointment-settings';

type Props = {
  appointmentSettings: ReturnType<typeof useAppointmentSettings>;
};

export default function AccountScheduleAppointmentPaymentsCard(
  props: Props,
) {
  const { appointmentSettings } = props;
  return (
    <Card
      sx={{
        width: '100%', // Set to full width to match the other cards
        minHeight: 400,
      }}
    >
      <CardHeader
        title={
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
          >
            {/* You can add an icon here if you want  */}
            <PaymentIcon />
            <Typography variant="h6">Payments</Typography>
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
            md={6}
          >
            <Typography variant="subtitle1">
              Automatically charge patients when the appointments status changes to completed
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            md={6}
          >
            <Switch
              checked={appointmentSettings.state.appointment_payment_auto_capture}
              onChange={appointmentSettings.onChange}
              name={'appointment_payment_auto_capture'}
            />
          </Grid>
          <Divider sx={{ my: 3, width: '100%' }} />
          <Grid
            item
            xs={12}
            md={6}
          >
            <Typography variant="subtitle1">
              For clients without a valid payment card, automatically send out an invoice
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            md={6}
          >
            <Switch
              checked={appointmentSettings.state.appointment_auto_send_invoice}
              onChange={appointmentSettings.onChange}
              name={'appointment_auto_send_invoice'}
            />
          </Grid>

          <Divider sx={{ my: 3, width: '100%' }} />
          <Grid
            item
            xs={12}
            md={6}
          >
            <Typography variant="subtitle1">
              Require payment in advance for an appointment before scheduling
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            md={6}
          >
            <Switch
              checked={appointmentSettings.state.appointment_payment_required}
              onChange={appointmentSettings.onChange}
              name={'appointment_payment_required'}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
