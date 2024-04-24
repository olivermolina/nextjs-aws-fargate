import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useGoogleCalendarSetting } from '../../../hooks/use-google-calendar-setting';
import { SeverityPill } from '../../../components/severity-pill';
import React from 'react';
import BackdropLoading from '../account/account-billing-reactivate-backdrop';
import AccountScheduleDisconnectCalendarDialog
  from '../account/account-schedule-disconnect-calendar-dialog';
import AccountSchedulePullCalendarDialog from '../account/account-schedule-pull-calendar-dialog';
import { getBaseUrl } from '../../../utils/get-base-url';

type GettingStartedSyncCalendarsProps = {
  handleNext: () => void;
};

export default function GettingStartedSyncCalendars({
                                                      handleNext,
                                                    }: GettingStartedSyncCalendarsProps) {
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
  } = useGoogleCalendarSetting(false, getBaseUrl() + '/dashboard/getting-started?step=3');

  return (
    <>
      <Container>
        <Stack
          spacing={1}
          alignItems={'center'}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'normal',
            }}
          >
            Always stay up to date
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 'normal',
              pb: 2,
            }}
          >
            Luna Health checks your calendar for conflicts, so appointments are only scheduled when
            you&apos;re available
          </Typography>

          <Stack
            direction="column"
            justifyContent="flex-start"
            alignItems="stretch"
            spacing={2}
            sx={{
              py: 2,
            }}
          >
            {!isLoading && data && (
              <FormControlLabel
                label={
                  <Stack
                    direction={'row'}
                    spacing={1}
                  >
                    <Typography variant="subtitle1">{data.email}</Typography>
                    <SeverityPill color={'success'}> CONNECTED</SeverityPill>
                  </Stack>
                }
                control={
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
                }
              />
            )}

            <FormControlLabel
              label="Push to Calendar - Your Luna Calendar entries will appear in your Google Calendar"
              control={
                <Switch
                  checked={state.push_calendar}
                  onChange={onChange}
                  name={'push_calendar'}
                />
              }
            />

            <FormControlLabel
              label="Pull from Calendar - Your blocked off time from Google Calendar will apper in Luna's Calendar as 'busy'"
              control={
                <Switch
                  checked={state.pull_calendar}
                  onChange={onChange}
                  name={'pull_calendar'}
                />
              }
            />
          </Stack>

          {!data && (
            <Button
              variant={'outlined'}
              startIcon={
                <img
                  src={'/assets/google-logo.svg'}
                  alt={'Google Logo'}
                />
              }
              onClick={() => {
                setConnectLoading(true);
                googleLogin();
              }}
            >
              Sign in with Google
            </Button>
          )}
          <Button onClick={handleNext}>{data ? 'Next' : 'Skip'}</Button>
        </Stack>
      </Container>

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
