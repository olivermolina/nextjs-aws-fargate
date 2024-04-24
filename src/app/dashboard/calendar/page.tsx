'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DateSelectArg, EventClickArg, EventDropArg } from '@fullcalendar/core';
import Calendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/material/styles/createTheme';
import momentTimezonePlugin from '@fullcalendar/moment-timezone';

import { MenuItem, Select, SelectChangeEvent, Skeleton } from '@mui/material';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { useDialog } from 'src/hooks/use-dialog';
import { usePageView } from 'src/hooks/use-page-view';
import { CalendarEventDialog } from 'src/sections/dashboard/calendar/calendar-event-dialog';
import { CalendarToolbar } from 'src/sections/dashboard/calendar/calendar-toolbar';
import { CalendarContainer } from 'src/sections/dashboard/calendar/calendar-container';
import { useDispatch, useSelector } from 'src/store';
import { thunks } from 'src/thunks/calendar';
import type { CalendarEvent, CalendarView } from 'src/types/calendar';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker'; // or '@mui/lab/StaticDatePicker'
import { trpc } from '../../_trpc/client';
import { Prisma, RolePermissionLevel, User, UserType } from '@prisma/client';
import { getUserFullName } from '../../../utils/get-user-full-name';
import LinearProgress from '@mui/material/LinearProgress';

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import moment from 'moment-timezone';

import toast from 'react-hot-toast';
import { useAuth } from 'src/hooks/use-auth';
import { getBaseUrl } from 'src/utils/get-base-url';
import { paths } from '../../../paths';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useServiceStore } from 'src/hooks/use-services-store';
import { usePatientsStore } from '../../../hooks/use-patient-store';
import { useGetPermissionByResource } from '../../../hooks/use-get-permission-by-resource';
import { PermissionResourceEnum } from '../../../hooks/use-role-permissions';
import FormGroup from '@mui/material/FormGroup';
import Checkbox from '@mui/material/Checkbox';
import UserAvatar from '../../../components/user-avatar';
import { ConsultationDrawer } from '../../../sections/dashboard/consultation/consultation-drawer';
import {
  ConsultationListContainer,
} from '../../../sections/dashboard/consultation/consultation-list-container';
import { EventImpl } from '@fullcalendar/core/internal';
import SvgIcon from '@mui/material/SvgIcon';
import VideocamIcon from '@mui/icons-material/Videocam';
import { grey } from '@mui/material/colors';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useSearchParams } from '../../../hooks/use-search-params';

dayjs.extend(utc);
dayjs.extend(timezone);

export interface CreateDialogData {
  range?: {
    start: number;
    end: number;
  };
}

interface UpdateDialogData {
  eventId?: string;
}

const useEvents = (
  date: Date,
  selectedStaffs: Record<string, boolean>,
  selectedServices: Record<string, boolean>,
  selectedLocations: Record<string, boolean>,
): CalendarEvent[] => {
  const dispatch = useDispatch();
  const events = useSelector((state) => state.calendar.events);

  const handleEventsGet = useCallback((): void => {
    dispatch(thunks.getEvents(date, selectedStaffs, selectedServices, selectedLocations));
  }, [dispatch, date, selectedStaffs, selectedServices, selectedLocations]);

  useEffect(
    () => {
      handleEventsGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [date, selectedStaffs, selectedServices, selectedLocations],
  );

  return events;
};

const useCurrentEvent = (
  events: CalendarEvent[],
  dialogData?: UpdateDialogData,
): CalendarEvent | undefined => {
  return useMemo((): CalendarEvent | undefined => {
    if (!dialogData) {
      return undefined;
    }

    return events.find((event) => event.id === dialogData!.eventId);
  }, [dialogData, events]);
};

const useStaffsStore = () => {
  const [selectedStaffs, setSelectedStaffs] = useState<Record<string, boolean>>({});

  const { data, isLoading } = trpc.user.list.useQuery(
    {
      active: true,
      type: [UserType.STAFF],
      sortDir: Prisma.SortOrder.asc,
    },
    {
      keepPreviousData: true,
    }
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.name === 'all' && event.target.checked) {
      const staffs = data?.items.reduce(
        (acc, staff) => {
          acc[staff.id] = true;
          return acc;
        },
        {} as Record<string, boolean>,
      );
      setSelectedStaffs({
        ...staffs,
        all: true,
      });
      return;
    }

    if (event.target.name === 'all' && !event.target.checked) {
      setSelectedStaffs({});
      return;
    }

    setSelectedStaffs({
      ...selectedStaffs,
      [event.target.name]: event.target.checked,
    });
  };

  useEffect(() => {
    const staffs = data?.items || [];
    if (staffs.length > 0) {
      setSelectedStaffs(
        staffs.reduce(
          (acc, staff) => {
            acc[staff.id] = false;
            return acc;
          },
          {} as Record<string, boolean>,
        )
      );
    }
  }, [data]);

  return {
    staffs: data?.items || [],
    selectedStaffs,
    setSelectedStaff: setSelectedStaffs,
    isLoading,
    handleChange,
  };
};

const now = dayjs(new Date());

const Page = () => {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('id');
  const rootRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();
  const calendarRef = useRef<Calendar | null>(null);
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
  const [date, setDate] = useState<Date>(new Date());
  const staffsStore = useStaffsStore();
  const serviceStore = useServiceStore();
  const patientStore = usePatientsStore();
  const isLoading = useSelector((state) => state.calendar.isLoading);
  const [timeZone, setTimeZone] = useState<string>(moment.tz.guess());
  const [selectedLocations, setSelectedLocations] = useState<Record<string, boolean>>({});
  const events = useEvents(
    date,
    staffsStore.selectedStaffs,
    serviceStore.selectedServices,
    selectedLocations,
  );
  const [view, setView] = useState<CalendarView>(mdUp ? 'timeGridDay' : 'dayGridMonth');
  const createDialog = useDialog<CreateDialogData>();
  const updateDialog = useDialog<UpdateDialogData>();
  const viewDialog = useDialog<EventImpl>();
  const updatingEvent = useCurrentEvent(events, updateDialog.data);
  const permission = useGetPermissionByResource(PermissionResourceEnum.SCHEDULING);
  const hasEditAccess = useMemo(() => {
    if (!permission) {
      return false;
    }
    return permission.editAccessLevel !== RolePermissionLevel.NONE;
  }, [permission]);

  const timeZones = moment.tz.names();

  const { user } = useAuth();

  const shareLink = useMemo(
    () => `${getBaseUrl()}${paths.schedule.index.replace(':slug', user?.username || '')}`,
    [user],
  );

  const [selectedDate, setSelectedDate] = useState(now);

  const { data: locations } = trpc.location.list.useQuery(undefined, {
    keepPreviousData: true,
  });

  const handleChangeLocationFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.name === 'all' && event.target.checked) {
      const allLocations = locations?.map((location) => location.id) || [];
      const newSelectedLocations = allLocations.reduce(
        (acc, location) => {
          acc[location] = true;
          return acc;
        },
        {} as Record<string, boolean>,
      );
      setSelectedLocations({
        ...newSelectedLocations,
        all: true,
        telemedicine: true,
      });
      return;
    }

    if (event.target.name === 'all' && !event.target.checked) {
      setSelectedLocations({});
      return;
    }

    setSelectedLocations({
      ...selectedLocations,
      [event.target.name]: event.target.checked,
    });
  };

  usePageView();

  // Time zone selection handler corrected for Material-UI Select component
  const handleTimeZoneChange = (event: SelectChangeEvent<string>) => {
    setTimeZone(event.target.value as string);
  };

  const handleScreenResize = useCallback((): void => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      const newView = mdUp ? 'dayGridMonth' : 'timeGridDay';

      calendarApi.changeView(newView);
      setView(newView);
    }
  }, [calendarRef, mdUp]);

  useEffect(
    () => {
      handleScreenResize();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mdUp],
  );

  useEffect(() => {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 150);
  }, [viewDialog.open]);

  const handleViewChange = useCallback((view: CalendarView): void => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.changeView(view);
      setView(view);
    }
  }, []);

  const handleDateToday = useCallback((): void => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.today();
      setDate(calendarApi.getDate());
    }
  }, []);

  const handleDatePrev = useCallback((): void => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.prev();
      setDate(calendarApi.getDate());
    }
  }, []);

  const handleDateNext = useCallback((): void => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.next();
      setDate(calendarApi.getDate());
    }
  }, []);

  const handleRangeSelect = useCallback(
    (arg: DateSelectArg): void => {
      const calendarEl = calendarRef.current;

      if (calendarEl) {
        const calendarApi = calendarEl.getApi();

        calendarApi.unselect();
      }

      createDialog.handleOpen({
        range: {
          start: arg.start.getTime(),
          end: arg.end.getTime(),
        },
      });
    },
    [createDialog],
  );

  const handleEventSelect = useCallback(
    (arg: EventClickArg): void => {
      if (arg.event.title === 'Busy') {
        toast.error('You can\'t edit this external event.');
        return;
      }

      viewDialog.handleOpen(arg.event);
    },
    [updateDialog],
  );

  const handleEdit = (consultationId: string) => {
    updateDialog.handleOpen({
      eventId: consultationId,
    });
  };

  const handleEventResize = useCallback(
    async (arg: EventResizeDoneArg): Promise<void> => {
      const { event } = arg;

      try {
        await dispatch(
          thunks.updateEvent({
            eventId: event.id,
            update: {
              start: event.start?.getTime(),
              end: event.end?.getTime(),
            },
          })
        );
      } catch (err) {
        console.error(err);
      }
    },
    [dispatch],
  );

  const handleEventDrop = useCallback(
    async (arg: EventDropArg): Promise<void> => {
      const { event } = arg;

      try {
        await dispatch(
          thunks.updateEvent({
            eventId: event.id,
            update: {
              start: event.start?.getTime(),
              end: event.end?.getTime(),
            },
          })
        );
      } catch (err) {
        console.error(err);
      }
    },
    [dispatch],
  );

  const handleCopyLink = useCallback(() => {
    navigator.clipboard
      .writeText(shareLink)
      .then(() => {
        toast.success('Link copied');
      })
      .catch(() => {
        toast.error('Failed to copy link ');
      });
  }, [shareLink]);

  useEffect(() => {
    if (eventId) {
      viewDialog.handleOpen({
        id: eventId,
      } as EventImpl);
    }
  }, [eventId, events]);

  return (
    <>
      <Box
        component="main"
        ref={rootRef}
        sx={{
          display: 'flex',
          flex: '1 1 auto',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box
          ref={rootRef}
          sx={{
            bottom: 0,
            display: 'flex',
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
            width: '100%',
            maxWidth: '100%',
          }}
        >
          <ConsultationListContainer open={viewDialog.open}>
            <Container
              maxWidth={false}
              sx={{ width: '100%', maxWidth: '100%', padding: 0, margin: 0 }}
            >
              <Stack
                spacing={1}
                direction={{ xs: 'column', lg: 'row' }}
                sx={{
                  width: '100%',
                  p: 1,
                }}
              >
                <Stack
                  spacing={1}
                  justifyContent={{ xs: 'center', lg: 'flex-start' }}
                  alignItems={{ xs: 'center', lg: 'flex-start' }}
                  sx={{ maxWidth: { xs: '100%', lg: 400 }, p: { xs: 2, lg: 0 } }}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <StaticDatePicker
                      sx={{ backgroundColor: 'transparent', width: 100 }}
                      displayStaticWrapperAs="desktop"
                      openTo="day"
                      value={selectedDate}
                      onChange={(newValue) => {
                        const newDate = newValue ?? dayjs();
                        setSelectedDate(newDate);
                        setDate(newDate.toDate());
                        const calendarEl = calendarRef.current;
                        if (calendarEl) {
                          const calendarApi = calendarEl.getApi();
                          calendarApi.gotoDate(newDate.toDate());
                        }
                      }}
                    />
                  </LocalizationProvider>

                  {/* Time Zone Selector with Label and Margin */}
                  <FormControl
                    fullWidth
                    size="small"
                    sx={{ mt: 2 }}
                  >
                    <InputLabel id="time-zone-selector-label">Time Zone</InputLabel>
                    <Select
                      labelId="time-zone-selector-label"
                      id="time-zone-selector"
                      value={timeZone}
                      onChange={handleTimeZoneChange}
                      label="Time Zone" // This should match the InputLabel
                    >
                      {timeZones.map((zone) => (
                        <MenuItem
                          key={zone}
                          value={zone}
                        >
                          {zone}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Margin between Time Zone Selector and Calendar Share */}
                  <Box sx={{ my: 2, width: '100%' }}>
                    {/* Adjust the margin as needed */}
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                    >
                      Calendar Share
                    </Typography>
                    <TextField
                      fullWidth
                      defaultValue={shareLink}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              edge="end"
                              onClick={handleCopyLink}
                            >
                              <ContentCopyIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  {/* Accordion for Staff Selection */}
                  <Accordion sx={{ width: '100%' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1">Staff</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <FormControl
                        component="fieldset"
                        sx={{ width: '100%' }}
                      >
                        {staffsStore.isLoading && (
                          <Stack spacing={1}>
                            {Array.from(Array(3).keys()).map((i) => (
                              <Stack
                                key={i}
                                direction={'row'}
                                spacing={1}
                                useFlexGap
                              >
                                <Skeleton
                                  variant="circular"
                                  width={25}
                                  height={25}
                                />
                                <Skeleton width={'50%'} />
                              </Stack>
                            ))}
                          </Stack>
                        )}
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Checkbox
                                name={'all'}
                                checked={staffsStore.selectedStaffs.all || false}
                                onChange={staffsStore.handleChange}
                              />
                            }
                            label={'All staffs'}
                          />

                          {!staffsStore.isLoading &&
                            staffsStore.staffs.map((staff: User) => (
                              <FormControlLabel
                                key={staff.id}
                                value={staff.id}
                                control={
                                  <Checkbox
                                    name={staff.id}
                                    checked={staffsStore.selectedStaffs[staff.id] || false}
                                    onChange={staffsStore.handleChange}
                                  />
                                }
                                sx={{
                                  '& .MuiFormControlLabel-label': {
                                    width: '100%',
                                  },
                                }}
                                label={
                                  <Stack
                                    direction={'row'}
                                    alignItems={'center'}
                                    justifyContent={'space-between'}
                                    flexGrow={1}
                                  >
                                    <Typography sx={{ flexGrow: 1 }}>
                                      {getUserFullName(staff)}
                                    </Typography>
                                    <UserAvatar userId={staff.id} />
                                  </Stack>
                                }
                              />
                            ))}
                        </FormGroup>
                      </FormControl>
                    </AccordionDetails>
                  </Accordion>

                  {/* Accordion for Service Type Selection */}
                  <Accordion sx={{ width: '100%' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1">Service type</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <FormControl
                        component="fieldset"
                        sx={{ width: '100%' }}
                      >
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Checkbox
                                name={'all'}
                                checked={serviceStore.selectedServices.all || false}
                                onChange={serviceStore.handleChange}
                              />
                            }
                            label={'All services'}
                          />

                          {serviceStore.services.map((service) => (
                            <FormControlLabel
                              key={service.id}
                              control={
                                <Checkbox
                                  name={service.id}
                                  checked={serviceStore.selectedServices[service.id] || false}
                                  onChange={serviceStore.handleChange}
                                />
                              }
                              label={service.name}
                            />
                          ))}
                        </FormGroup>
                      </FormControl>
                    </AccordionDetails>
                  </Accordion>

                  {/* Accordion for Location Selection */}
                  <Accordion sx={{ width: '100%' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1">Appointment Type</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <FormControl
                        component="fieldset"
                        sx={{ width: '100%' }}
                      >
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Checkbox
                                name={'all'}
                                checked={selectedLocations.all || false}
                                onChange={handleChangeLocationFilter}
                              />
                            }
                            sx={{
                              '& .MuiFormControlLabel-label': {
                                width: '100%',
                              },
                            }}
                            label={
                              <Stack
                                direction={'row'}
                                spacing={1}
                                alignItems={'center'}
                                justifyContent={'space-between'}
                                flexGrow={1}
                              >
                                <Typography>All appointment types</Typography>
                              </Stack>
                            }
                          />

                          <FormControlLabel
                            control={
                              <Checkbox
                                name={'telemedicine'}
                                checked={selectedLocations.telemedicine || false}
                                onChange={handleChangeLocationFilter}
                              />
                            }
                            sx={{
                              '& .MuiFormControlLabel-label': {
                                width: '100%',
                              },
                            }}
                            label={
                              <Stack
                                direction={'row'}
                                spacing={1}
                                alignItems={'center'}
                                justifyContent={'space-between'}
                                flexGrow={1}
                              >
                                <Typography>Telemedicine</Typography>
                                <SvgIcon>
                                  <VideocamIcon sx={{ color: grey[500] }} />
                                </SvgIcon>
                              </Stack>
                            }
                          />

                          {locations?.map((location) => (
                            <FormControlLabel
                              key={location.id}
                              control={
                                <Checkbox
                                  name={location.id}
                                  checked={selectedLocations[location.id] || false}
                                  onChange={handleChangeLocationFilter}
                                />
                              }
                              sx={{
                                '& .MuiFormControlLabel-label': {
                                  width: '100%',
                                },
                              }}
                              label={
                                <Stack
                                  direction={'row'}
                                  spacing={1}
                                  alignItems={'center'}
                                  justifyContent={'space-between'}
                                  flexGrow={1}
                                >
                                  <Typography>{location.display_name}</Typography>
                                  <SvgIcon>
                                    <LocationOnIcon sx={{ color: grey[500] }} />
                                  </SvgIcon>
                                </Stack>
                              }
                            />
                          ))}
                        </FormGroup>
                      </FormControl>
                    </AccordionDetails>
                  </Accordion>
                </Stack>

                <Stack
                  spacing={3}
                  sx={{ width: '100%', p: { xs: 2, lg: 0 } }}
                >
                  <CalendarToolbar
                    date={date}
                    onAddClick={createDialog.handleOpen}
                    onDateNext={handleDateNext}
                    onDatePrev={handleDatePrev}
                    onDateToday={handleDateToday}
                    onViewChange={handleViewChange}
                    view={view}
                    hasEditAccess={hasEditAccess}
                  />
                  {isLoading && <LinearProgress />}
                  <Card sx={{ width: '100%', overflow: 'hidden' }}>
                    <CalendarContainer>
                      <Calendar
                        allDayMaintainDuration
                        dayMaxEventRows={3}
                        droppable
                        editable
                        eventClick={handleEventSelect}
                        eventDisplay="block"
                        eventDrop={handleEventDrop}
                        eventResizableFromStart
                        eventResize={handleEventResize}
                        events={events}
                        headerToolbar={false}
                        height={800}
                        initialDate={date}
                        initialView={view}
                        plugins={[
                          dayGridPlugin,
                          interactionPlugin,
                          listPlugin,
                          timeGridPlugin,
                          timelinePlugin,
                          momentTimezonePlugin,
                        ]}
                        ref={calendarRef}
                        rerenderDelay={10}
                        select={handleRangeSelect}
                        selectable
                        weekends
                        timeZone={timeZone}
                      />
                    </CalendarContainer>
                  </Card>
                </Stack>
              </Stack>
            </Container>
          </ConsultationListContainer>
          <ConsultationDrawer
            container={rootRef.current}
            onClose={viewDialog.handleClose}
            open={viewDialog.open}
            consultationId={viewDialog.data?.id}
            handleEdit={handleEdit}
          />
        </Box>
      </Box>
      <CalendarEventDialog
        action="create"
        onAddComplete={createDialog.handleClose}
        onClose={createDialog.handleClose}
        open={createDialog.open}
        range={createDialog.data?.range}
        staffs={staffsStore.staffs}
        patients={patientStore.patients}
        timezone={timeZone}
        services={serviceStore.services}
        locations={locations}
      />

      <CalendarEventDialog
        action="update"
        event={updatingEvent}
        onClose={updateDialog.handleClose}
        onDeleteComplete={updateDialog.handleClose}
        onEditComplete={updateDialog.handleClose}
        open={updateDialog.open}
        staffs={staffsStore.staffs}
        patients={patientStore.patients}
        timezone={timeZone}
        services={serviceStore.services}
        locations={locations}
      />
    </>
  );
};

export default Page;
