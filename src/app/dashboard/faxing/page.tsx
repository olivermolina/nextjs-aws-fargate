'use client';

import React, { ChangeEvent, useCallback, useMemo, useState } from 'react';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';

import { usePageView } from 'src/hooks/use-page-view';
import { RolePermissionLevel } from '@prisma/client';
import { PermissionResourceEnum } from '../../../hooks/use-role-permissions';
import { useGetPermissionByResource } from '../../../hooks/use-get-permission-by-resource';
import BackdropLoading
  from '../../../sections/dashboard/account/account-billing-reactivate-backdrop';
import FaxEditor from '../../../sections/dashboard/fax/fax-editor';
import { useFaxCompose } from '../../../hooks/use-fax-compose';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Divider from '@mui/material/Divider';
import SentFax from '../../../sections/dashboard/fax/sent-fax';
import ReceivedFax from '../../../sections/dashboard/fax/received-fax';
import { trpc } from '../../_trpc/client';
import { useOrganizationStore } from '../../../hooks/use-organization';
import { getCountryFaxCode } from '../../../utils/get-country-code';
import { formatPhoneNumber } from '../../../utils/format-phone-number';

type ActiveTabValue = 'received' | 'sent';

interface TabOption {
  label: string;
  value: ActiveTabValue;
}

const tabs: TabOption[] = [
  {
    label: 'Received Faxes',
    value: 'received',
  },
  {
    label: 'Sent Faxes',
    value: 'sent',
  },
];

const Page = () => {
  const { data: organization } = useOrganizationStore();
  const { data } = trpc.extension.getSrFaxSettings.useQuery();
  const permission = useGetPermissionByResource(PermissionResourceEnum.PATIENT_INFORMATION);
  const { handleSave, isLoading, handleMaximize, handleMinimize, handleOpen, handleClose, state } =
    useFaxCompose();
  const [currentTab, setCurrentTab] = useState('received');

  const handleTabsChange = useCallback((event: ChangeEvent<any>, value: ActiveTabValue): void => {
    setCurrentTab(value);
  }, []);

  const countryCode = useMemo(
    () =>
      getCountryFaxCode(
        organization?.address?.country || organization?.billing_address?.country || 'US',
      ),
    [organization],
  );

  usePageView();

  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 2,
        }}
      >
        <Container maxWidth={false}>
          <Stack spacing={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              spacing={4}
            >
              <Typography variant="h4">Faxing</Typography>
              {permission?.editAccessLevel !== RolePermissionLevel.NONE && (
                <Button
                  startIcon={
                    <SvgIcon>
                      <PlusIcon />
                    </SvgIcon>
                  }
                  variant="contained"
                  onClick={handleOpen}
                >
                  Compose
                </Button>
              )}
            </Stack>
            <Card>
              <Stack
                direction={'row'}
                justifyContent={'space-between'}
                alignItems={'center'}
              >
                <Tabs
                  indicatorColor="primary"
                  onChange={handleTabsChange}
                  scrollButtons="auto"
                  sx={{ px: 3 }}
                  textColor="primary"
                  value={currentTab}
                  variant="scrollable"
                >
                  {tabs.map((tab) => (
                    <Tab
                      key={tab.label}
                      label={tab.label}
                      value={tab.value}
                    />
                  ))}
                </Tabs>
                <Typography
                  variant={'subtitle1'}
                  sx={{
                    p: 2,
                  }}
                >
                  Your Fax number:{' '}
                  <strong>
                    +{countryCode} {formatPhoneNumber(data?.fax_number || '')}
                  </strong>
                </Typography>
              </Stack>
              <Divider />
              {currentTab === 'received' && <ReceivedFax />}
              {currentTab === 'sent' && <SentFax />}
            </Card>
          </Stack>
        </Container>
      </Box>
      <FaxEditor
        open={state.isOpen}
        maximize={state.isFullScreen}
        onClose={handleClose}
        onMaximize={handleMaximize}
        onMinimize={handleMinimize}
        onSubmit={handleSave}
        defaultAttachments={[]}
      />
      <BackdropLoading
        message={'Sending fax'}
        open={isLoading}
      />
    </>
  );
};

export default Page;
