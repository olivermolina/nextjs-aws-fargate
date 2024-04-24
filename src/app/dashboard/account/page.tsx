'use client';

import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { AccountBillingSettings } from 'src/sections/dashboard/account/account-billing-settings';
import { AccountGeneralSettings } from 'src/sections/dashboard/account/account-general-settings';
import { AccountTeamSettings } from 'src/sections/dashboard/account/account-team-settings';
import { trpc } from '../../_trpc/client';
import { Prisma, RolePermissionLevel, User, UserType } from '@prisma/client';
import { getUserFullName } from '../../../utils/get-user-full-name';
import {
  AccountServiceSettings,
} from '../../../sections/dashboard/account/account-service-settings';
import {
  AccountOrganizationSettings,
} from '../../../sections/dashboard/account/account-organization-settings';
import {
  AccountAvailabilitySettings,
} from '../../../sections/dashboard/account/account-availability-settings';
import { useSearchParams } from '../../../hooks/use-search-params';
import { PermissionResourceEnum } from '../../../hooks/use-role-permissions';
import { useAuth } from '../../../hooks/use-auth';
import AccountStaffSettings from '../../../sections/dashboard/account/account-staff-settings';
import { useRouter } from '../../../hooks/use-router';
import { paths } from '../../../paths';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { RouterLink } from '../../../components/router-link';
import { Skeleton } from '@mui/material';
import { useGetPermissionByResource } from '../../../hooks/use-get-permission-by-resource';
import { AccountLogs } from '../../../sections/dashboard/account/account-logs';

const NO_VIEW_ACCESS_TABS = [
  { label: 'Profile', value: 'profile', order: 1 },
  { label: 'Scheduling', value: 'scheduling', order: 2 },
  { label: 'Services', value: 'services', order: 3 },
];

const DEFAULT_TABS = [
  { label: 'Profile', value: 'profile', order: 1 },
  { label: 'Billing', value: 'billing', order: 2 },
  { label: 'Team', value: 'team', order: 3 },
  { label: 'Scheduling', value: 'scheduling', order: 4 },
  { label: 'Services', value: 'services', order: 5 },
  { label: 'Organization', value: 'organization', order: 6 },
  { label: 'Logs', value: 'logs', order: 7 },
];

const Page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get('tab') || 'profile';
  const staffId = searchParams.get('staffId');
  const { user } = useAuth();

  const { data: staff } = trpc.user.get.useQuery(
    {
      id: staffId!,
    },
    {
      enabled: !!staffId,
      refetchOnWindowFocus: false,
    },
  );

  const refetchMembers = useCallback(async () => {
    await refetch();
  }, [staffId, tab]);

  const { data, refetch } = trpc.user.list.useQuery(
    {
      type: [UserType.STAFF],
      sortDir: Prisma.SortOrder.asc,
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    },
  );
  const permission = useGetPermissionByResource(PermissionResourceEnum.ORGANIZATION);
  const hasPermission = !!permission;
  const hasViewAccess = useMemo(() => {
    if (!permission) {
      return false;
    }
    return permission.viewAccessLevel === RolePermissionLevel.EVERYTHING;
  }, [permission]);

  const hasEditAccess = useMemo(() => {
    if (!permission) {
      return false;
    }
    return permission.editAccessLevel === RolePermissionLevel.EVERYTHING;
  }, [permission]);

  const tabs = useMemo(() => {
    if (hasViewAccess) {
      return DEFAULT_TABS;
    }

    return NO_VIEW_ACCESS_TABS;
  }, [hasViewAccess]);

  const members = (data ? data.items : []) as User[];

  const [currentTab, setCurrentTab] = useState<string>(tab);

  usePageView();

  const handleTabsChange = useCallback(
    (event: ChangeEvent<any>, value: string): void => {
      setCurrentTab(value);
      router.push(paths.dashboard.account + '?tab=' + value);
    },
    [router],
  );

  useEffect(() => {
    if (tab) {
      setCurrentTab(tab);
    }
  }, [tab]);

  return (
    <>
      <Seo title="Dashboard: Account" />
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
            <Stack spacing={1}>
              <Typography variant="h4"> Account </Typography>
              {staffId && staff && tab === 'team' && (
                <Breadcrumbs separator={'>'}>
                  <Link
                    color="text.primary"
                    component={RouterLink}
                    href={paths.dashboard.account + '?tab=team'}
                    variant="subtitle1"
                  >
                    Team
                  </Link>
                  <Typography
                    color="text.secondary"
                    variant="subtitle1"
                  >
                    {getUserFullName(staff)}
                  </Typography>
                </Breadcrumbs>
              )}
            </Stack>

            <div>
              {!hasPermission ? (
                <Stack
                  direction={'row'}
                  spacing={1}
                  maxWidth={'md'}
                >
                  {Array.from({ length: 3 }).map((i, index) => (
                    <Skeleton
                      key={index}
                      width={50}
                    />
                  ))}
                </Stack>
              ) : (
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
              )}

              <Divider />
            </div>
          </Stack>

          {!hasPermission && (
            <Skeleton
              height={350}
              variant={'rectangular'}
            />
          )}

          {hasPermission && currentTab === 'profile' && (
            <AccountGeneralSettings
              avatar={user?.avatar || ''}
              email={user?.email || ''}
              name={getUserFullName(user)}
            />
          )}
          {hasPermission && currentTab === 'billing' && (
            <AccountBillingSettings
              plan="standard"
              hasEditAccess={hasEditAccess}
            />
          )}
          {hasPermission && currentTab === 'team' && !staffId && (
            <AccountTeamSettings
              members={members}
              refetch={refetch}
              hasEditAccess={hasEditAccess}
            />
          )}
          {hasPermission && currentTab === 'team' && staffId && (
            <AccountStaffSettings
              staffId={staffId}
              refetchMembers={refetchMembers}
            />
          )}
          {hasPermission && currentTab === 'scheduling' && <AccountAvailabilitySettings />}
          {hasPermission && currentTab === 'services' && <AccountServiceSettings />}
          {hasPermission && currentTab === 'organization' && (
            <AccountOrganizationSettings hasEditAccess={hasEditAccess} />
          )}
          {hasPermission && currentTab === 'logs' && <AccountLogs />}
        </Container>
      </Box>
    </>
  );
};

export default Page;
