import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import CalendarIcon from '@untitled-ui/icons-react/build/esm/Calendar';
import InfoIcon from '@mui/icons-material/Info';
import React from 'react';
import BackdropLoading from './account-billing-reactivate-backdrop';
import { Skeleton } from '@mui/material';
import { SeverityPill } from '../../../components/severity-pill';
import AccountScheduleDisconnectCalendarDialog from './account-schedule-disconnect-calendar-dialog';
import AccountSchedulePullCalendarDialog from './account-schedule-pull-calendar-dialog';
import { useGoogleCalendarSetting } from '../../../hooks/use-google-calendar-setting';

export default function AccountScheduleCalendarSyncCard() {
  const {
    data,
    checked,
    isLoading,
    mutation,
    disconnectMutation,
    handleDisconnect,
    state,
    onChange,
    setConnectLoading,
    connectLoading,
    dialog,
    syncDialog,
    googleLogin,
  } = useGoogleCalendarSetting(true);

  return (
    <>
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
              <CalendarIcon />
              <Typography variant="h6">Calendar Sync</Typography>
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
                Luna Checks your Calendar for conflicts, so appointments are only scheduled when
                you&apos;re available
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
              {!isLoading && data && (
                <Stack
                  direction={'row'}
                  spacing={1}
                >
                  <Typography variant="subtitle1">{data.email}</Typography>
                  <SeverityPill color={'success'}> CONNECTED</SeverityPill>
                </Stack>
              )}
              {!isLoading && !data && (
                <Typography variant="subtitle1">Connect your Google calendar</Typography>
              )}
              {isLoading && (
                <Typography>
                  <Skeleton />
                </Typography>
              )}
            </Grid>

            {!isLoading && (
              <Grid
                item
                xs={12}
                md={6}
              >
                <Switch
                  checked={checked}
                  onChange={(event) => {
                    if (event.target.checked) {
                      setConnectLoading(true);
                      googleLogin();
                    } else {
                      dialog.handleOpen();
                    }
                  }}
                />
              </Grid>
            )}

            {data && (
              <>
                <Divider sx={{ my: 3, width: '100%' }} />
                <Grid
                  item
                  xs={12}
                  md={6}
                >
                  <Typography variant="subtitle1">
                    Push to Calendar - Your Luna Calendar entries will appear in your Google
                    Calendar
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={6}
                >
                  <Switch
                    checked={state.push_calendar}
                    onChange={onChange}
                    name={'push_calendar'}
                  />
                </Grid>

                <Divider sx={{ my: 3, width: '100%' }} />
                <Grid
                  item
                  xs={12}
                  md={6}
                >
                  <Typography variant="subtitle1">
                    Pull from Calendar - Your blocked off time from Google Calendar will apper in
                    Luna&apos;s Calendar as &apos;busy&apos;
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={6}
                >
                  <Switch
                    checked={state.pull_calendar}
                    onChange={onChange}
                    name={'pull_calendar'}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>
      <BackdropLoading
        open={mutation.isLoading || connectLoading}
        message={'Connecting your Google calendar'}
      />
      <AccountScheduleDisconnectCalendarDialog
        isLoading={disconnectMutation.isLoading}
        open={dialog.open}
        handleClose={dialog.handleClose}
        handleDisconnect={handleDisconnect}
      />
      <AccountSchedulePullCalendarDialog
        open={syncDialog.open}
        handleClose={syncDialog.handleClose}
      />
    </>
  );
}
