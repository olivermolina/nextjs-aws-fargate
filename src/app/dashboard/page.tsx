'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { usePageView } from 'src/hooks/use-page-view';
import { useSettings } from 'src/hooks/use-settings';
import { OverviewEvents } from 'src/sections/dashboard/overview/overview-events';
import { OverviewInbox } from 'src/sections/dashboard/overview/overview-inbox';
import { OverviewTransactions } from 'src/sections/dashboard/overview/overview-transactions';
import {
  OverviewSubscriptionUsage,
} from 'src/sections/dashboard/overview/overview-subscription-usage';
import { OverViewQuickStats } from '../../sections/dashboard/overview/overview-quick-stats';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import ChevronDownIcon from '@untitled-ui/icons-react/build/esm/ChevronDown';
import { useMemo, useState } from 'react';
import Menu from '@mui/material/Menu';
import { MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { trpc } from '../_trpc/client';
import { useAuth } from '../../hooks/use-auth';
import { InvoiceStatus, Status } from '@prisma/client';
import { getUserFullName } from '../../utils/get-user-full-name';
import { useStaffsStore } from '../../hooks/use-staffs-store';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import {
  OverviewConsultationPieChart,
} from '../../sections/dashboard/overview/overview-consultation-pie-chart';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/material/styles/createTheme';
import { useGettingStarted } from '../../hooks/use-getting-started';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

type DateFilter = {
  startDate: Date | null;
  endDate: Date | null;
};

type Filter = DateFilter & {
  selectedFilter: 'current-week' | 'last-week' | 'last-month' | 'custom';
  staffId: string;
};

const useInvoiceOverview = (filters: Filter) => {
  const { user } = useAuth();
  const [tab, setTab] = useState<InvoiceStatus | 'all' | undefined>(undefined);
  const {
    data: invoices,
    isLoading,
    isFetching,
  } = trpc.invoice.list.useQuery({
    rowsPerPage: 5,
    userIds: [], // Ensure userIds is an array
    page: 0,
    staffId: filters.staffId === 'all' ? undefined : filters.staffId,
    status: tab === 'all' ? undefined : tab,
  });

  const setTabValue = (tabValue: InvoiceStatus | 'all' | undefined) => {
    if (!tabValue) return;
    setTab(tabValue);
  };

  const transactions = useMemo(
    () =>
      invoices?.items?.map((invoice) => ({
        id: invoice.id,
        amount: invoice.total_amount,
        createdAt: invoice.created_at.getTime(),
        currency: user?.organization?.currency.toLowerCase() || 'usd',
        sender: getUserFullName(invoice.patient),
        status: invoice.status,
      })) || [],
    [invoices, user],
  );

  return {
    tab,
    setTabValue,
    transactions,
    isLoading: isLoading || isFetching,
  };
};

const useConsultationOverview = (filters: Filter) => {
  const { data: consultations, isLoading } = trpc.consultation.list.useQuery({
    rowsPerPage: 5,
    page: 0,
    staff_ids: filters.staffId === 'all' ? undefined : [filters.staffId],
    from: dayjs().format('yyyy-MM-DD'),
  });

  const latestConsultations = useMemo(
    () =>
      consultations?.items.map((consultation) => ({
        id: consultation.id,
        createdAt: consultation.start_time,
        description: `${dayjs(consultation.start_time).format('HH:mm')} to ${dayjs(
          consultation.end_time,
        ).format('HH:mm')}`,
        title: consultation.service?.name || consultation.description || consultation.title || '',
      })) || [],
    [consultations],
  );

  return {
    latestConsultations,
    isLoading,
  };
};

const Page = () => {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const settings = useSettings();
  const staffsStore = useStaffsStore();
  const [filters, setFilters] = useState<Filter>({
    startDate: dayjs().day(0).toDate(),
    endDate: dayjs().day(6).toDate(),
    selectedFilter: 'current-week',
    staffId: 'all',
  });

  const { data } = trpc.organization.dashboardQuickStats.useQuery({
    from: filters.startDate?.toString() || dayjs().day(0).format('yyyy-mm-dd'),
    to: filters.endDate?.toString() || dayjs().day(6).format('yyyy-mm-dd'),
    staffId: filters.staffId === 'all' ? undefined : filters.staffId,
  });

  const { data: consultationCountsByDateRange } = trpc.consultation.countsByDateRange.useQuery({
    from: filters.startDate?.toString() || dayjs().day(0).format('yyyy-mm-dd'),
    to: filters.endDate?.toString() || dayjs().day(6).format('yyyy-mm-dd'),
    staffId: filters.staffId === 'all' ? undefined : filters.staffId,
  });

  const invoiceOverview = useInvoiceOverview(filters);

  const consultationOverview = useConsultationOverview(filters);

  const {
    data: latestMessages,
    isLoading,
    refetch,
    isFetching,
  } = trpc.organization.latestMessages.useQuery(
    {
      take: 5,
      staffId: filters.staffId === 'all' ? undefined : filters.staffId,
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  const quickStats = useMemo(() => {
    return {
      currencySymbol: user?.organization.currency_symbol || '$',
      income:
        data?.incomeAggregations?.find((aggregate) => aggregate.status === InvoiceStatus.PAID)?._sum
          .total_amount || 0,
      incomeChange:
        ((data?.incomeAggregations?.find((aggregate) => aggregate.status === InvoiceStatus.PAID)
            ?._sum.total_amount || 0) -
          (data?.prevIncomeAggregations?.find(
            (aggregate) => aggregate.status === InvoiceStatus.PAID,
          )?._sum.total_amount || 0)) /
        (data?.prevIncomeAggregations?.find((aggregate) => aggregate.status === InvoiceStatus.PAID)
          ?._sum.total_amount || 1),
      pending:
        data?.incomeAggregations?.find((aggregate) => aggregate.status === InvoiceStatus.PENDING)
          ?._sum.total_amount || 0,
      pendingChange:
        ((data?.incomeAggregations?.find((aggregate) => aggregate.status === InvoiceStatus.PENDING)
            ?._sum.total_amount || 0) -
          (data?.prevIncomeAggregations?.find(
            (aggregate) => aggregate.status === InvoiceStatus.PENDING,
          )?._sum.total_amount || 0)) /
        (data?.prevIncomeAggregations?.find((aggregate) => aggregate.status === InvoiceStatus.PENDING)
          ?._sum.total_amount || 1),
      appointments: data?.consultationsCount || 0,
      appointmentsChange: ((data?.consultationsCount || 0) - (data?.prevConsultationsCount || 0)) / (data?.prevConsultationsCount || 1),
      newPatients: data?.patientCount || 0,
      consultationPieChart: {
        pending:
          data?.consultationAggregations?.find((aggregate) => aggregate.status === Status.PENDING)
            ?._count.status || 0,
        confirmed:
          data?.consultationAggregations?.find((aggregate) => aggregate.status === Status.CONFIRMED)
            ?._count.status || 0,
        canceled:
          data?.consultationAggregations?.find((aggregate) => aggregate.status === Status.CANCELED)
            ?._count.status || 0,
        completed:
          data?.consultationAggregations?.find((aggregate) => aggregate.status === Status.COMPLETED)
            ?._count.status || 0,
      },
    };
  }, [data, user]);

  const [customDateFilter, setCustomDateFilter] = useState<DateFilter>({
    startDate: dayjs().day(0).toDate(),
    endDate: dayjs().day(6).toDate(),
  });

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setFilters((prevState) => ({
      ...prevState,
      selectedFilter: 'custom',
    }));

    setCustomDateFilter({
      startDate: filters.startDate,
      endDate: filters.endDate,
    });
  };

  const handleCustomDateChangeConfirm = () => {
    setAnchorEl(null);
    setFilters((prevState) => ({
      ...prevState,
      ...customDateFilter,
      selectedFilter: 'custom',
    }));
  };

  const handleLastWeekClick = () => {
    setFilters((prevState) => ({
      ...prevState,
      startDate: dayjs().day(0).subtract(1, 'week').toDate(),
      endDate: dayjs().day(7).subtract(1, 'week').toDate(),
      selectedFilter: 'last-week',
    }));
  };

  const handleLastMonthClick = () => {
    setFilters((prevState) => ({
      ...prevState,
      startDate: dayjs().subtract(1, 'month').startOf('month').toDate(),
      endDate: dayjs().subtract(1, 'month').endOf('month').toDate(),
      selectedFilter: 'last-month',
    }));
  };

  const handleStartDateChange = (date: Date | null) => {
    setCustomDateFilter((prevState) => ({
      ...prevState,
      startDate: date,
    }));
  };

  const handleEndDateChange = (date: Date | null) => {
    setCustomDateFilter((prevState) => ({
      ...prevState,
      endDate: date,
    }));
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChangeStaff = (event: SelectChangeEvent) => {
    setFilters((prevState) => ({
      ...prevState,
      staffId: event.target.value as string,
    }));
  };

  const categories = useMemo(() => {
    const defaultCategories = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    if (!consultationCountsByDateRange) return defaultCategories;

    if (consultationCountsByDateRange.seriesType === 'weekly') {
      return consultationCountsByDateRange.categories.map(
        (category, i) =>
          `${dayjs(category).format('MMM D')} - ${
            i >= consultationCountsByDateRange.categories.length - 1
              ? dayjs(category).endOf('month').format('MMM D')
              : dayjs(consultationCountsByDateRange.categories[i + 1]).format('MMM D')
          }`,
      );
    }

    if (consultationCountsByDateRange.seriesType === 'monthly') {
      return consultationCountsByDateRange.categories.map((category) => dayjs(category).format('MMM YYYY'));
    }

    return defaultCategories;

  }, [consultationCountsByDateRange]);
  useGettingStarted();
  usePageView();

  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth={settings.stretch ? false : 'xl'}>
          <Grid
            container
            disableEqualOverflow
            spacing={{
              xs: 3,
              lg: 4,
            }}
          >
            <Grid xs={12}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                spacing={2}
              >
                <Typography variant="h4">Overview</Typography>

                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={2}
                  alignItems={'center'}
                >
                  <Typography
                    variant={'h6'}
                    sx={{
                      textAlign: 'center',
                    }}
                  >
                    {dayjs(filters.startDate).format('MMM D, YYYY')} to{' '}
                    {dayjs(filters.endDate).format('MMM D, YYYY')}
                  </Typography>
                  <Button
                    variant={filters.selectedFilter === 'last-month' ? 'contained' : 'outlined'}
                    color={'primary'}
                    onClick={handleLastMonthClick}
                    fullWidth={mdDown}
                  >
                    Last Month
                  </Button>
                  <Button
                    variant={filters.selectedFilter === 'last-week' ? 'contained' : 'outlined'}
                    color={'primary'}
                    onClick={handleLastWeekClick}
                    fullWidth={mdDown}
                  >
                    Last Week
                  </Button>
                  <Button
                    fullWidth={mdDown}
                    endIcon={
                      <SvgIcon>
                        <ChevronDownIcon />
                      </SvgIcon>
                    }
                    onClick={handleClick}
                    variant={
                      filters.selectedFilter === 'custom' ||
                      filters.selectedFilter === 'current-week'
                        ? 'contained'
                        : 'outlined'
                    }
                  >
                    Custom
                  </Button>

                  <FormControl
                    sx={{ m: 1, minWidth: 150 }}
                    fullWidth={mdDown}
                  >
                    <InputLabel id="select-staff-label">Staff</InputLabel>
                    <Select
                      labelId="select-staff-label"
                      id="select-staff-id"
                      value={filters.staffId}
                      onChange={handleChangeStaff}
                      input={<OutlinedInput label="Tag" />}
                      MenuProps={MenuProps}
                      size={'small'}
                      fullWidth={mdDown}
                    >
                      <MenuItem value={'all'}>
                        <ListItemText primary={'All'} />
                      </MenuItem>

                      {staffsStore.staffs.map((staff) => (
                        <MenuItem
                          key={staff.id}
                          value={staff.id}
                        >
                          <ListItemText primary={getUserFullName(staff)} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
                <Menu
                  id="actions-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  MenuListProps={{
                    'aria-labelledby': 'actions-button',
                  }}
                >
                  <MenuItem>
                    <Stack spacing={2}>
                      <DatePicker
                        format="yyyy-MM-dd"
                        label="From"
                        onChange={handleStartDateChange}
                        value={customDateFilter.startDate || null}
                      />
                      <DatePicker
                        format="yyyy-MM-dd"
                        label="To"
                        onChange={handleEndDateChange}
                        value={customDateFilter.endDate || null}
                      />
                      <Button
                        variant={'contained'}
                        onClick={handleCustomDateChangeConfirm}
                      >
                        OK
                      </Button>
                    </Stack>
                  </MenuItem>
                </Menu>
              </Stack>
            </Grid>
            <Grid xs={12}>
              <OverViewQuickStats {...quickStats} />
            </Grid>

            <Grid
              xs={12}
              md={6}
              lg={8}
            >
              <OverviewSubscriptionUsage
                chartSeries={[
                  {
                    name: 'New consultations',
                    data: consultationCountsByDateRange?.series || [],
                  },
                ]}
                categories={categories}
              />
            </Grid>
            <Grid
              xs={12}
              md={6}
              lg={4}
            >
              <OverviewConsultationPieChart {...quickStats.consultationPieChart} />
            </Grid>

            <Grid
              xs={12}
              md={6}
              lg={4}
            >
              <OverviewInbox
                messages={latestMessages || []}
                isLoading={isLoading || isFetching}
                handleRefresh={() => refetch()}
              />
            </Grid>
            <Grid
              xs={12}
              md={6}
              lg={4}
            >
              <OverviewTransactions {...invoiceOverview} />
            </Grid>
            <Grid
              xs={12}
              md={6}
              lg={4}
            >
              <OverviewEvents
                events={consultationOverview.latestConsultations}
                isLoading={consultationOverview.isLoading}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default Page;
