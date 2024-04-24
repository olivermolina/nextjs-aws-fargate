import { FC, SyntheticEvent, useEffect, useState } from 'react';
//import InputAdornment from '@mui/material/InputAdornment'; // Import InputAdornment
import { AvailabilityInput } from 'src/utils/zod-schemas/availability';
import { useAuth } from 'src/hooks/use-auth';
import dayjs from 'dayjs';
import { useAppointmentSettings } from '../../../hooks/use-appointment-settings';
import AccountScheduleAppointmentPaymentsCard from './account-schedule-appointment-payments-card';
import AccountScheduleAppointmentRemindersCard from './account-schedule-appointment-reminders-card';
import AccountScheduleLinkCard from './account-schedule-link-card';
import { useAvailabilitySettings } from '../../../hooks/use-availability-settings';
import { useScheduleLinkSettings } from '../../../hooks/use-schedule-link-settings';
import AccountScheduleAvailabilityCard from './account-schedule-availability-card';
import AccountScheduleCalendarSyncCard from './account-schedule-calendar-sync-card';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AccountScheduleTelemedecineSettingsCard from './account-schedule-telemedicine-settings-card';
import AccountScheduleAppointmentRequestCard from './account-schedule-appointment-request-card';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { a11yProps, TabPanel } from './account-vertical-tab';

const tabs = [
  'Availability',
  'Scheduling Link',
  'Reminders',
  'Payments',
  'Calendar Sync',
  'Telemedicine Settings',
  'Appointment Request',
];

export const AccountAvailabilitySettings: FC = () => {
  const { user } = useAuth();
  const availabilitySettings = useAvailabilitySettings();
  const scheduleLinkSettings = useScheduleLinkSettings();
  const appointmentSettings = useAppointmentSettings();
  const [value, setValue] = useState(0);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (user) {
      scheduleLinkSettings.reset({
        id: user.id,
        slug: user.username || '',
      });
      const timezone =
        availabilitySettings.availability?.timezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone;

      const availabilitySlots =
        availabilitySettings.availability?.availability_slots?.reduce(
          (acc: AvailabilityInput['availabilitySlots'], curr) => {
            const dayOfWeek = curr.day_of_week;
            const daySlot = {
              id: curr.id,
              start_time: dayjs(curr.start_time).toDate(),
              end_time: dayjs(curr.end_time).toDate(),
            };
            acc = acc || [];
            const index = acc?.findIndex((slot) => slot.dayOfWeek === dayOfWeek);
            if (index !== -1) {
              acc[index].daySlots.push(daySlot);
            } else {
              acc.push({
                dayOfWeek: dayOfWeek,
                daySlots: [daySlot],
              });
            }
            return acc;
          },
          [],
        ) || [];

      availabilitySettings.reset({
        id: availabilitySettings.availability?.id,
        name: 'Working Hours',
        timezone: timezone,
        user_id: user.id,
        organization_id: user.organization.id,
        availabilitySlots,
      });

      availabilitySettings.setActiveDays(availabilitySlots?.map((slot) => slot.dayOfWeek));
    }
  }, [user, availabilitySettings.availability]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: 'flex',
        height: '100%',
        alignItems: 'flex-start',
        gap: 2,
      }}
    >
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        sx={{
          '&& .MuiTab-root': {
            alignItems: 'baseline',
            marginLeft: 0,
          },
          minWidth: 150,
        }}
      >
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            label={tab}
            {...a11yProps(index)}
            sx={{
              whiteSpace: 'nowrap',
              pr: 4,
            }}
          />
        ))}
      </Tabs>

      {/* Availability Card*/}
      <TabPanel
        value={value}
        index={0}
      >
        <AccountScheduleAvailabilityCard availabilitySettings={availabilitySettings} />
      </TabPanel>

      {/* Scheduling Link Card*/}
      <TabPanel
        value={value}
        index={1}
      >
        <AccountScheduleLinkCard scheduleLinkSettings={scheduleLinkSettings} />
      </TabPanel>

      {/* Appointment Reminders Card */}
      <TabPanel
        value={value}
        index={2}
      >
        <AccountScheduleAppointmentRemindersCard appointmentSettings={appointmentSettings} />
      </TabPanel>

      {/* Appointment Payments Card */}
      <TabPanel
        value={value}
        index={3}
      >
        <AccountScheduleAppointmentPaymentsCard appointmentSettings={appointmentSettings} />
      </TabPanel>

      {/* Calendar Sync Card */}
      <TabPanel
        value={value}
        index={4}
      >
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
          <AccountScheduleCalendarSyncCard />
        </GoogleOAuthProvider>
      </TabPanel>

      {/* Appointment Telemedicine Settings Card */}
      <TabPanel
        value={value}
        index={5}
      >
        <AccountScheduleTelemedecineSettingsCard appointmentSettings={appointmentSettings} />
      </TabPanel>

      {/* Appointment Request Card */}
      <TabPanel
        value={value}
        index={6}
      >
        <AccountScheduleAppointmentRequestCard appointmentSettings={appointmentSettings} />
      </TabPanel>
    </Box>
  );
};
