import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import VideocamIcon from '@mui/icons-material/VideocamOutlined';
import { useAppointmentSettings } from '../../../hooks/use-appointment-settings';
import InfoIcon from '@mui/icons-material/Info';
import React from 'react';

type Props = {
  appointmentSettings: ReturnType<typeof useAppointmentSettings>;
};

export default function AccountScheduleTelemedecineSettingsCard(
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
            <VideocamIcon />
            <Typography variant="h6">Telemedicine Settings</Typography>
          </Stack>
        }
        subheader={
          <Stack
            direction={'row'}
            justifyContent="flex-start"
            alignItems="center"
            spacing={2}
            sx={{ backgroundColor: '#ece6fb', p: 1, borderRadius: 0.5, mt: 1 }}
          >
            <InfoIcon color={'primary'} />
            <Typography variant={'caption'}>
              Recording is needed in order to generate transcriptions and SOAP notes. You may
              disabled or enable recording any time during the call.
            </Typography>
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
              Enable recording by default for transcriptions and SOAP notes
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            md={6}
          >
            <Switch
              checked={appointmentSettings.state.telemedicine_auto_recording}
              onChange={appointmentSettings.onChange}
              name={'telemedicine_auto_recording'}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
