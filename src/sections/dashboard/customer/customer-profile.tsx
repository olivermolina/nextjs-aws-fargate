import React, { useEffect, useMemo, useState } from 'react';
import { AccordionDetails, Box, MenuItem, Skeleton, styled, Typography } from '@mui/material';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import { usePatientFeeds } from '../../../hooks/use-patient-feeds';
import { useParams } from 'next/navigation';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CustomerProfileTimeLineCard from './customer-profile-timeline-card';
import { useSearchParams } from '../../../hooks/use-search-params';
import Link from '@mui/material/Link';
import { RouterLink } from '../../../components/router-link';
import { paths } from '../../../paths';
import SvgIcon from '@mui/material/SvgIcon';
import ArrowLeftIcon from '@untitled-ui/icons-react/build/esm/ArrowLeft';
import CustomerProfileChartingNote from './customer-profile-charting-note';
import Paper from '@mui/material/Paper';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchMdIcon from '@untitled-ui/icons-react/build/esm/SearchMd';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import ChevronDownIcon from '@untitled-ui/icons-react/build/esm/ChevronDown';
import Menu from '@mui/material/Menu';
import useMediaQuery from '@mui/material/useMediaQuery';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import Accordion, { AccordionSlots } from '@mui/material/Accordion';
import { Theme } from '@mui/material/styles';
import sortBy from 'lodash/sortBy';
import dayjs from 'dayjs';
import { PatientWithInvoices } from '../../../types/patient';
import CustomerProfileBasicInformation from './customer-profile-basic-information';
import CustomerProfileQuickNotes from './customer-profile-quick-notes';
import CustomerProfileAllergy from './customer-profile-allergy';
import CustomerProfileProblemList from './customer-profile-problem-list';
import CustomerProfileHistory from './customer-profile-history';
import Grid, { GridProps } from '@mui/material/Grid';
import Collapse from '@mui/material/Collapse';
import CustomerProfileVitals from './customer-profile-vitals';
import { useOrganizationStore } from '../../../hooks/use-organization';
import { trpc } from '../../../app/_trpc/client';
import CustomerProfileAppointmentRequest from './customer-profile-appointment-request';

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '1rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor: 'background.paper',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  marginLeft: theme.spacing(2),
}));

const StyledAccordion = styled(Accordion)(() => ({
  boxShadow: 'none', // Removes the shadow
  '&:before': {
    display: 'none', // Hide the default MUI Accordion's before element
  },
  '&.Mui-expanded': {
    margin: 0, // Remove the margin when accordion is expanded
  },
  '&:not(:last-child)': {
    borderBottom: 0, // Remove the border from all items except the last one
  },
  '&:not(:first-child)': {
    borderTop: 0, // Remove the top border
  },
}));

type CustomerProfileProps = {
  customer: PatientWithInvoices;
  handleEditAssignedStaff?: () => void;
  hasEditAccess?: boolean;
  refetch?: any;
  view?: 'all' | 'info' | 'chart';
};

const sxLeftPanel: GridProps['sx'] = {
  position: { xs: 'relative', lg: 'sticky' }, // Make the Paper component sticky
  top: { xs: undefined, lg: 0 }, // Stick to the top of the screen
  maxHeight: '100vh', // Max height to viewport height
  overflowY: 'auto', // Scrollbar for the Paper component
  pb: 4,
};

function CustomerProfile(props: CustomerProfileProps) {
  const { data: organization } = useOrganizationStore();
  const { customer, refetch } = props;
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const searchParams = useSearchParams();
  const chartId = searchParams.get('chartId');
  const videoUrl = searchParams.get('video_url');
  const params = useParams();
  const patientFeeds = usePatientFeeds(params.customerId as string);

  const { data, isLoading } = trpc.organization.getConfigureClinicalProfile.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const { data: logo } = trpc.user.getSignedUrlFile.useQuery(
    {
      key: organization?.logo || '',
    },
    {
      enabled: !!organization?.logo,
      refetchOnWindowFocus: false,
    }
  );

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
    // Use currentTarget to anchor the menu to the button
    setAnchorEl(event.currentTarget);
    setSelectedIndex(index);
    event.stopPropagation(); // Stop event from reaching the accordion toggle
  };

  const [dateAnchorEl, setDateAnchorEl] = useState<null | HTMLElement>(null);
  const openDate = Boolean(dateAnchorEl);

  const handleDateClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDateAnchorEl(event.currentTarget);
  };
  const handleDateClose = () => {
    setDateAnchorEl(null);
  };

  const handleAccordionToggle =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const clinicalProfileAccordionList = useMemo(() => {
    const list = ['Basic Information'];
    if (!data) return list;

    if (data.quick_notes) list.push('Quick Notes');
    if (data.vitals) list.push('Vitals');
    if (data.allergies) list.push('Allergies');
    if (data.problems) list.push('Problem List');
    if (data.history) list.push('History');
    if (data.medications) list.push('Rx Meds', 'OTC Meds');

    return list;
  }, [data]);

  useEffect(() => {
    patientFeeds.refetch();
  }, [chartId]);

  return (
    <Grid
      container
      spacing={props.view === 'all' ? 2 : 0}
      justifyContent={'flex-start'}
      sx={{ height: '100%' }}
    >
      {chartId && props.view === 'all' && !videoUrl && (
        <Grid
          item
          xs={12}
        >
          <Link
            color="text.primary"
            component={RouterLink}
            href={paths.dashboard.customers.index + `/${params.customerId}?tab=profile`}
            sx={{
              display: 'inline-flex',
            }}
            underline="hover"
          >
            <SvgIcon>
              <ArrowLeftIcon />
            </SvgIcon>
            <Typography variant="subtitle2">Back</Typography>
          </Link>
        </Grid>
      )}

      {/* Left Panel*/}
      {(props.view === 'all' || props.view === 'info') && !isLoading ? (
        <Grid
          item
          xs={12}
          md={props.view === 'info' ? 12 : 3}
          sx={sxLeftPanel}
        >
          <Paper
            sx={{
              p: { xs: 0, lg: 2 },
              marginLeft: { xs: 0, lg: '-24px' },
              overflowY: 'auto',
              height: '100%',
              zIndex: 1000,
            }}
          >
            {clinicalProfileAccordionList.map((text, index) => {
              const panelId = `panel${index}`;
              return (
                <StyledAccordion
                  key={index}
                  expanded={expanded === panelId}
                  onChange={handleAccordionToggle(panelId)}
                  slots={{ transition: Collapse as AccordionSlots['transition'] }}
                  slotProps={{ transition: { timeout: 400 } }}
                  sx={{
                    '& .MuiAccordion-region': { height: expanded === panelId ? 'auto' : 0 },
                    '& .MuiAccordionDetails-root': {
                      display: expanded === panelId ? 'block' : 'none',
                    },
                  }}
                >
                  <AccordionSummary
                    aria-controls={`${panelId}-content`}
                    id={`${panelId}-header`}
                    sx={{
                      p: 0,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Typography sx={{ flex: 1, marginLeft: (theme) => theme.spacing(2) }}>
                        {text}
                      </Typography>
                      <IconButton
                        onClick={(event) => handleMenuClick(event, index)}
                        size="small"
                        edge="end"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {text === 'Basic Information' && (
                      <CustomerProfileBasicInformation
                        customer={customer}
                        handleEditAssignedStaff={props.handleEditAssignedStaff}
                        hasEditAccess={props.hasEditAccess}
                      />
                    )}

                    {text === 'Quick Notes' && (
                      <CustomerProfileQuickNotes
                        id={customer.id}
                        quickNotes={customer.quick_notes || ''}
                        refetch={refetch}
                      />
                    )}

                    {text === 'Allergies' && <CustomerProfileAllergy id={customer.id} />}
                    {text === 'Problem List' && <CustomerProfileProblemList id={customer.id} />}
                    {text === 'History' && (
                      <CustomerProfileHistory
                        id={customer.id}
                        settings={data}
                      />
                    )}
                    {text === 'Vitals' && (
                      <CustomerProfileVitals
                        id={customer.id}
                        country={organization?.address?.country}
                        settings={data}
                      />
                    )}
                  </AccordionDetails>
                </StyledAccordion>
              );
            })}
          </Paper>
        </Grid>
      ) : (
        <Grid
          item
          xs={12}
          md={props.view === 'info' ? 12 : 3}
          sx={sxLeftPanel}
        >
          <Skeleton
            variant={'rectangular'}
            height={'100%'}
            width={'100%'}
          />
        </Grid>
      )}

      {(props.view === 'chart' || (chartId && props.view !== 'info')) && (
        <Grid
          item
          xs={12}
          md={props.view === 'chart' ? 12 : 9}
          sx={{ height: '100%', pb: 4 }}
        >
          {/* View/edit Chart */}
          <CustomerProfileChartingNote
            id={chartId!}
            userId={params.customerId as string}
          />
        </Grid>
      )}

      {props.view === 'all' && !chartId && (
        <Grid
          item
          xs={12}
          md={9}
        >
          {/* Search bar*/}
          <Box
            component={Paper}
            sx={{
              p: 2,
              ml: 2,
              mr: 4,
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent={'space-between'}
            >
              <Autocomplete
                freeSolo
                fullWidth
                options={[]}
                renderInput={(params): JSX.Element => (
                  <TextField
                    {...params}
                    variant={'outlined'}
                    fullWidth
                    placeholder="Search chart"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SvgIcon>
                            <SearchMdIcon />
                          </SvgIcon>
                        </InputAdornment>
                      ),
                    }}
                    onChange={patientFeeds.handleSearchInputChange}
                  />
                )}
              />
              <Button
                fullWidth={mdDown}
                endIcon={
                  <SvgIcon>
                    <ChevronDownIcon />
                  </SvgIcon>
                }
                onClick={handleDateClick}
                variant={'contained'}
                sx={{
                  minWidth: 100,
                }}
              >
                Date
              </Button>
              <FormControl
                fullWidth
                sx={(theme) => ({
                  [theme.breakpoints.up('sm')]: {
                    minWidth: 150,
                    maxWidth: 150,
                  },
                })}
              >
                <InputLabel id="select-chart-status-label">Chart Status</InputLabel>
                <Select
                  labelId="select-chart-status-label"
                  onChange={patientFeeds.handleChangeChartStatus}
                  label="Chart Status"
                  value={patientFeeds.filters.chartStatus || 'all'}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="signed">Signed</MenuItem>
                  <MenuItem value="unsigned">Unsigned</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Menu
              id="date-menu"
              anchorEl={dateAnchorEl}
              open={openDate}
              onClose={handleDateClose}
              MenuListProps={{
                'aria-labelledby': 'date-range-button',
              }}
            >
              <MenuItem>
                <Stack spacing={2}>
                  <DatePicker
                    format="yyyy-MM-dd"
                    label="From"
                    onChange={patientFeeds.handleDateChangeFrom}
                    value={patientFeeds.filters.dateFrom || null}
                  />
                  <DatePicker
                    format="yyyy-MM-dd"
                    label="To"
                    onChange={patientFeeds.handleDateChangeTo}
                    value={patientFeeds.filters.dateTo || null}
                  />
                  <Button
                    variant={'contained'}
                    onClick={handleDateClose}
                  >
                    OK
                  </Button>
                </Stack>
              </MenuItem>
            </Menu>
          </Box>

          {/* Appointment Requests Notifications*/}
          <CustomerProfileAppointmentRequest
            showAll
            showBorderRadius
            showHeader
            sxStackProps={{
              my: 2,
              ml: 2,
              mr: 4,
            }}
            refetchFeeds={patientFeeds.refetch}
          />

          {/* Timeline */}
          <Timeline
            sx={{
              [`& .${timelineItemClasses.root}:before`]: {
                flex: 0,
                padding: 0,
              },
            }}
          >
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent
                sx={{
                  mb: 2,
                }}
              >
                <Stack spacing={2}>
                  {patientFeeds.isLoading ? (
                    <>
                      <Skeleton width={150} />
                      <Skeleton
                        variant={'rectangular'}
                        height={150}
                      />
                    </>
                  ) : (
                    <>
                      <Typography
                        variant={'h6'}
                        sx={{ color: 'grey.400' }}
                      >
                        {patientFeeds.upComingAppointments.length === 0
                          ? 'No upcoming appointments'
                          : 'Upcoming appointments'}
                      </Typography>

                      {/* Appointment Card */}
                      {patientFeeds.upComingAppointments.map((feed) => (
                        <CustomerProfileTimeLineCard
                          key={feed.id}
                          feed={feed}
                          refetchFeeds={patientFeeds.refetch}
                          organization={organization}
                          logo={logo}
                        />
                      ))}
                    </>
                  )}
                </Stack>
              </TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Stack spacing={2}>
                  {patientFeeds.isLoading ? (
                    <>
                      <Skeleton width={150} />
                      <Skeleton
                        variant={'rectangular'}
                        height={150}
                      />
                    </>
                  ) : (
                    <>
                      <Typography
                        variant={'h6'}
                        sx={{ color: 'grey.400' }}
                      >
                        {patientFeeds.currentWeekFeeds.length === 0
                          ? 'No appointments this week'
                          : 'This week'}
                      </Typography>
                      {patientFeeds.currentWeekFeeds.map((feed) => (
                        <CustomerProfileTimeLineCard
                          key={feed.id}
                          feed={feed}
                          refetchFeeds={patientFeeds.refetch}
                          organization={organization}
                          logo={logo}
                        />
                      ))}
                    </>
                  )}
                </Stack>
              </TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent
                sx={{
                  mb: 2,
                }}
              >
                <Stack spacing={2}>
                  {patientFeeds.isLoading ? (
                    <>
                      <Skeleton width={150} />
                      <Skeleton
                        variant={'rectangular'}
                        height={150}
                      />
                    </>
                  ) : (
                    <>
                      <Typography
                        variant={'h6'}
                        sx={{ color: 'grey.400' }}
                      >
                        {patientFeeds.previousWeekFeeds.length === 0
                          ? 'No appointments last week'
                          : 'Last week'}
                      </Typography>
                      {patientFeeds.previousWeekFeeds.map((feed) => (
                        <CustomerProfileTimeLineCard
                          key={feed.id}
                          feed={feed}
                          refetchFeeds={patientFeeds.refetch}
                          organization={organization}
                          logo={logo}
                        />
                      ))}
                    </>
                  )}
                </Stack>
              </TimelineContent>
            </TimelineItem>
            {patientFeeds.monthlyFeeds &&
              sortBy(Object.keys(patientFeeds.monthlyFeeds), (date) => new Date(date))
                .reverse()
                .map((date) => {
                  const feeds = patientFeeds.monthlyFeeds?.[date];
                  if (!feeds) return null;
                  return (
                    <TimelineItem key={date}>
                      <TimelineSeparator>
                        <TimelineDot />
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineContent
                        sx={{
                          mb: 2,
                        }}
                      >
                        <Stack spacing={2}>
                          <Typography
                            variant={'h6'}
                            sx={{ color: 'grey.400' }}
                          >
                            {dayjs(date).format('MMMM YYYY')}
                          </Typography>
                          {feeds.map((feed) => (
                            <CustomerProfileTimeLineCard
                              key={feed.id}
                              feed={feed}
                              refetchFeeds={patientFeeds.refetch}
                              organization={organization}
                              logo={logo}
                            />
                          ))}
                        </Stack>
                      </TimelineContent>
                    </TimelineItem>
                  );
                })}

            {patientFeeds.nextCursor ? (
              <TimelineItem>
                <TimelineSeparator></TimelineSeparator>
                <TimelineContent>
                  <Button onClick={() => patientFeeds.fetchNextPage()}>Load more</Button>
                </TimelineContent>
              </TimelineItem>
            ) : (
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot />
                </TimelineSeparator>
                <TimelineContent>
                  <Typography
                    variant={'h6'}
                    sx={{ color: 'grey.400' }}
                  >
                    No more
                  </Typography>
                </TimelineContent>
              </TimelineItem>
            )}
          </Timeline>
        </Grid>
      )}
    </Grid>
  );
}

export default React.memo(CustomerProfile);
