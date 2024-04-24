'use client';

import type { ChangeEvent } from 'react';
import { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import { useAuth } from 'src/hooks/use-auth';

import { usePageView } from 'src/hooks/use-page-view';
//import { AccountBillingSettings } from 'src/sections/dashboard/account/account-billing-settings';
import { AccountBillingSettings } from 'src/sections/patient/account/account-billing-settings';

import { AccountGeneralSettings } from 'src/sections/dashboard/account/account-general-settings';
import { trpc } from '../../_trpc/client';
import { getUserFullName } from 'src/utils/get-user-full-name';
import { Invoice } from 'src/types/invoice';

const tabs = [
  { label: 'Profile', value: 'profile' },
  { label: 'Billing', value: 'billing' },
];

const Page = () => {
  const { user } = useAuth();
  const { id } = user || {};

  const { data } = trpc.invoice.list.useQuery(
    {
      rowsPerPage: 1000,
      userIds: id ? [id] : [], // Ensure userIds is an array
      page: 0,
    },
    {
      keepPreviousData: true,
    }
  );

  const invoices = (data ? data.items : []) as Invoice[];

  const [currentTab, setCurrentTab] = useState<string>('profile');

  usePageView();

  const handleTabsChange = useCallback((event: ChangeEvent<any>, value: string): void => {
    setCurrentTab(value);
  }, []);

  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack
            spacing={3}
            sx={{ mb: 3 }}
          >
            <Typography variant="h4">Account</Typography>
            <div>
              <Tabs
                indicatorColor="primary"
                onChange={handleTabsChange}
                scrollButtons="auto"
                textColor="primary"
                value={currentTab}
                variant="scrollable"
              >
                {tabs.map((tab) => (
                  <Tab
                    key={tab.value}
                    label={tab.label}
                    value={tab.value}
                  />
                ))}
              </Tabs>
              <Divider />
            </div>
          </Stack>
          {currentTab === 'profile' && (
            <AccountGeneralSettings
              avatar={user?.avatar || ''}
              email={user?.email || ''}
              name={getUserFullName(user)}
            />
          )}
          {currentTab === 'billing' && <AccountBillingSettings invoices={invoices} />}
        </Container>
      </Box>
    </>
  );
};

export default Page;
