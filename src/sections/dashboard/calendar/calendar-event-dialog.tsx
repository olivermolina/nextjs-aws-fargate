import React, { FC, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import Trash02Icon from '@untitled-ui/icons-react/build/esm/Trash02';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { useDispatch, useSelector } from 'src/store';
import { thunks } from 'src/thunks/calendar';
import type { CalendarEvent, CalendarPatient, CalendarStaff } from 'src/types/calendar';
import MenuItem from '@mui/material/MenuItem';
import { Location, Status, User, UserType } from '@prisma/client';
import { SeverityPill, SeverityPillColor } from '../../../components/severity-pill';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { getUserFullName } from '../../../utils/get-user-full-name';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import EventIcon from '@mui/icons-material/Event';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { ServiceWithStaff } from 'src/types/service';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '../../../hooks/use-auth';
import UserAvatar from '../../../components/user-avatar';
import VideocamIcon from '@mui/icons-material/Videocam';
import { grey } from '@mui/material/colors';
import LocationOnIcon from '@mui/icons-material/LocationOn';

dayjs.extend(utc);
dayjs.extend(timezone);

const statusMap: Record<Status, SeverityPillColor> = {
  COMPLETED: 'success',
  PENDING: 'info',
  CANCELED: 'warning',
  CONFIRMED: 'primary',
};

interface Values {
  telemedicine: boolean;
  color: string;
  description: string;
  title: string;
  submit: null;
  staffs: CalendarStaff[];
  patient: CalendarPatient[];
  status: Status;
  scheduled_date: Date;
  start: Date;
  end: Date;
  serviceId: string;
  locationId?: string;
}

const filterOptions = createFilterOptions({
  matchFrom: 'start',
  stringify: (option: CalendarPatient | CalendarStaff) => getUserFullName(option),
});

const useInitialValues = (
  event?: CalendarEvent,
  range?: { start: number; end: number },
  patient?: User,
  staff?: User,
  locations?: Location[],
): Values => {
  return useMemo((): Values => {
    if (event) {
      return {
        color: event.color || '',
        description: event.description || '',
        scheduled_date: event.start ? new Date(event.start) : new Date(),
        start: event.start ? new Date(event.start) : new Date(),
        end: event.end ? new Date(event.end) : new Date(),
        title: event.title || '',
        submit: null,
        telemedicine: event.telemedicine,
        staffs: event.staffs,
        patient: event.patient,
        status: event.status,
        serviceId: event.serviceId,
        locationId:
          locations && locations.length > 0 && event.telemedicine
            ? 'telemedicine'
            : event.locationId || '',
      };
    }

    if (range) {
      return {
        color: '',
        description: '',
        scheduled_date: new Date(range.start),
        start: new Date(range.start),
        end: new Date(range.end),
        title: '',
        submit: null,
        telemedicine: false,
        staffs: staff ? [staff] : [],
        patient: patient ? [patient] : [],
        status: Status.PENDING,
        serviceId: '',
        locationId: '',
      };
    }

    return {
      color: '',
      description: '',
      scheduled_date: new Date(),
      start: new Date(),
      end: new Date(),
      title: '',
      submit: null,
      telemedicine: false,
      staffs: staff ? [staff] : [],
      patient: patient ? [patient] : [],
      status: Status.PENDING,
      serviceId: '',
      locationId: '',
    };
  }, [event, range]);
};

const validationSchema = Yup.object({
  description: Yup.string().max(5000),
  scheduled_date: Yup.date(),
  start_time: Yup.date(),
  end_time: Yup.date(),
  title: Yup.string(),
  telemedicine: Yup.bool(),
  patient: Yup.array(Yup.mixed<CalendarPatient>())
    .required('Patient is required')
    .min(1, 'Patient is required'),
  staffs: Yup.array(Yup.mixed<CalendarStaff>())
    .required('Staffs are requuired')
    .min(1, 'At least 1 staff is required'),
  status: Yup.mixed<Status>().required('Status is required'),
  serviceId: Yup.string().required('Appointment type is required'),
  locationId: Yup.string(),
});

type Action = 'create' | 'update';

interface CalendarEventDialogProps {
  action?: Action;
  event?: CalendarEvent;
  onAddComplete?: () => void;
  onClose?: () => void;
  onDeleteComplete?: () => void;
  onEditComplete?: () => void;
  open?: boolean;
  range?: { start: number; end: number };
  staffs: User[];
  patients: User[];
  defaultPatient?: User;
  defaultStaff?: User;
  timezone: string;
  services: ServiceWithStaff[];
  locations?: Location[];
}

export const CalendarEventDialog: FC<CalendarEventDialogProps> = (props) => {
  const { user } = useAuth();
  const {
    action = 'create',
    event,
    onAddComplete,
    onClose,
    onDeleteComplete,
    onEditComplete,
    open = false,
    range,
    staffs,
    patients,
    defaultPatient,
    defaultStaff,
    timezone,
    services,
    locations,
  } = props;
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.calendar.isLoading);
  const initialValues = useInitialValues(event, range, defaultPatient, defaultStaff, locations);
  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema,
    onSubmit: async (values, helpers): Promise<void> => {
      try {
        const data = {
          allDay: false,
          description: values.description,
          start: values.start.getTime(),
          end: values.end.getTime(),
          title: values.title,
          staffs: values.staffs,
          patient: values.patient,
          telemedicine:
            values.locationId === 'telemedicine'
              ? true
              : values.locationId
                ? false
                : values.telemedicine,
          status: values.status,
          serviceId: values.serviceId,
          creator: (user?.type === UserType.STAFF ? 'staff' : 'patient') as 'staff' | 'patient',
          locationId: values.locationId === 'telemedicine' ? undefined : values.locationId,
        };

        if (action === 'update') {
          await dispatch(
            thunks.updateEvent({
              eventId: event!.id,
              update: data,
            }),
          );
        } else {
          await dispatch(thunks.createEvent(data));
        }

        if (action === 'update') {
          onEditComplete?.();
        } else {
          onAddComplete?.();
        }
      } catch (err) {
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    },
  });

  const handleScheduleDateChange = useCallback(
    (date: Dayjs | null): void => {
      formik.setFieldValue('start', date?.toDate());
      formik.setFieldValue('scheduled_date', date?.toDate());
      // Prevent end date to be before start date
      if (formik.values.end && date && date.isAfter(dayjs(formik.values.end))) {
        formik.setFieldValue('end', date.toDate());
      }
    },
    [formik],
  );

  const handleStartDateChange = useCallback(
    (date: Dayjs | null): void => {
      formik.setFieldValue('start', date?.toDate());
      formik.setFieldValue('scheduled_date', date?.toDate());
      // Prevent end date to be before start date
      if (formik.values.end && date && date?.isAfter(dayjs(formik.values.end))) {
        formik.setFieldValue('end', date.toDate());
      }
    },
    [formik],
  );

  const handleEndDateChange = useCallback(
    (date: Dayjs | null): void => {
      formik.setFieldValue('end', date?.toDate());

      // Prevent start date to be after end date
      if (formik.values.start && date && date.isBefore(dayjs(formik.values.start))) {
        formik.setFieldValue('start', date.toDate());
        formik.setFieldValue('scheduled_date', date.toDate());
      }
    },
    [formik],
  );

  const handleDelete = useCallback(async (): Promise<void> => {
    if (!event) {
      return;
    }

    try {
      await dispatch(
        thunks.deleteEvent({
          eventId: event.id!,
        }),
      );
      onDeleteComplete?.();
    } catch (err) {
      console.error(err);
    }
  }, [dispatch, event, onDeleteComplete]);

  // @ts-ignore
  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      open={open}
    >
      <form onSubmit={formik.handleSubmit}>
        <Stack
          alignItems="center"
          direction="row"
          spacing={1}
          sx={{
            px: 2,
            py: 1,
          }}
        >
          <SvgIcon>
            <EventIcon />
          </SvgIcon>
          <Typography
            sx={{ flexGrow: 1 }}
            variant="h6"
          >
            {event ? 'Edit' : 'Schedule New'}
          </Typography>
          <IconButton onClick={onClose}>
            <SvgIcon>
              <XIcon />
            </SvgIcon>
          </IconButton>
        </Stack>
        <Stack
          spacing={2}
          sx={{ p: 3 }}
        >
          <Stack
            direction={'row'}
            spacing={2}
          >
            <Autocomplete
              fullWidth
              options={patients}
              filterSelectedOptions
              onChange={(e, value) => {
                formik.setFieldValue(
                  'patient',
                  value.filter((patient) => typeof patient !== 'string' && !!patient.id),
                );
              }}
              renderOption={(props: any, option) => (
                <Box {...props}>
                  <UserAvatar
                    userId={option.id}
                    includeFullName={true}
                  />
                </Box>
              )}
              value={formik.values.patient}
              getOptionLabel={(option) => {
                if (typeof option === 'string') {
                  return option;
                }
                return getUserFullName(option);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={!!(formik.touched.patient && formik.errors.patient)}
                  fullWidth
                  helperText={
                    formik.touched.patient &&
                    typeof formik.errors.patient === 'string' &&
                    formik.errors.patient
                  }
                  label="Patient"
                  name="patient"
                  onBlur={formik.handleBlur}
                />
              )}
              filterOptions={filterOptions}
              multiple
              renderTags={(value: readonly CalendarPatient[], getTagProps) =>
                value.map((option: CalendarPatient, index: number) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.id}
                    variant="outlined"
                    label={getUserFullName(option)}
                  />
                ))
              }
              freeSolo={formik.values.patient.length <= 1}
              getOptionDisabled={() => formik.values.patient.length >= 1}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />

            <Autocomplete
              fullWidth
              filterSelectedOptions
              options={staffs.filter(
                (staff) =>
                  !formik.values.staffs.map((assignedStaff) => assignedStaff.id).includes(staff.id),
              )}
              onChange={(e, value) => {
                formik.setFieldValue(
                  'staffs',
                  value.filter((staff) => typeof staff !== 'string' && !!staff.id),
                );
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderOption={(props: any, option) => (
                <Box {...props}>
                  <UserAvatar
                    userId={option.id}
                    includeFullName={true}
                  />
                </Box>
              )}
              value={formik.values.staffs}
              getOptionLabel={(option) => {
                if (typeof option === 'string') {
                  return '';
                }
                return getUserFullName(option);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={!!(formik.touched.staffs && formik.errors.staffs)}
                  fullWidth
                  helperText={
                    formik.touched.staffs &&
                    typeof formik.errors.staffs === 'string' &&
                    formik.errors.staffs
                  }
                  label="Staffs"
                  name="staffs"
                  onBlur={formik.handleBlur}
                />
              )}
              filterOptions={filterOptions}
              multiple
              renderTags={(value: readonly CalendarPatient[], getTagProps) =>
                value.map((option: CalendarPatient, index: number) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.id}
                    variant="outlined"
                    label={getUserFullName(option)}
                  />
                ))
              }
              freeSolo
            />
          </Stack>

          <TextField
            error={!!(formik.touched.serviceId && formik.errors.serviceId)}
            fullWidth
            helperText={formik.touched.serviceId && formik.errors.serviceId}
            label="Service type"
            name="serviceId"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.serviceId}
            multiline
            rows={3}
            select
          >
            {services.map((service) => (
              <MenuItem
                key={service.id}
                value={service.id}
              >
                {service.name}
              </MenuItem>
            ))}
          </TextField>

          {locations && locations.length > 0 && (
            <TextField
              error={!!(formik.touched.locationId && formik.errors.locationId)}
              fullWidth
              helperText={formik.touched.locationId && formik.errors.locationId}
              label="Appointment type"
              name="locationId"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.locationId}
              select
            >
              <MenuItem
                value={''}
                disabled
              >
                <em>Select Appointment type</em>
              </MenuItem>
              <MenuItem value={'telemedicine'}>
                <Stack
                  direction={'row'}
                  spacing={1}
                  justifyContent={'flex-start'}
                  alignItems={'center'}
                >
                  <SvgIcon>
                    <VideocamIcon sx={{ color: grey[500] }} />
                  </SvgIcon>
                  <Typography>Telemedicine</Typography>
                </Stack>
              </MenuItem>
              {locations?.map((location) => (
                <MenuItem
                  key={location.id}
                  value={location.id}
                >
                  <Stack
                    direction={'row'}
                    spacing={1}
                    justifyContent={'flex-start'}
                    alignItems={'center'}
                  >
                    <SvgIcon>
                      <LocationOnIcon sx={{ color: grey[500] }} />
                    </SvgIcon>
                    <Typography>{location.display_name}</Typography>
                    <Typography
                      variant={'caption'}
                      color={'text.secondary'}
                      sx={{
                        fontStyle: 'italic',
                      }}
                    >
                      in-person
                    </Typography>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            error={!!(formik.touched.description && formik.errors.description)}
            fullWidth
            helperText={formik.touched.description && formik.errors.description}
            label="Description"
            name="description"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.description}
            multiline
            rows={3}
          />

          {!locations ||
            (locations.length === 0 && (
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.telemedicine}
                    name="telemedicine"
                    onChange={formik.handleChange}
                  />
                }
                label="Telemedicine"
              />
            ))}

          <Grid
            container
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid
              item
              xs={5}
            >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={dayjs.utc(formik.values.start)}
                  label="Scheduled date"
                  onChange={handleScheduleDateChange}
                  timezone={timezone}
                />
              </LocalizationProvider>
            </Grid>
            <Grid
              item
              xs={3}
            >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="Start Time"
                  onChange={handleStartDateChange}
                  value={dayjs.utc(formik.values.start)}
                  timezone={timezone}
                />
              </LocalizationProvider>
            </Grid>

            <Grid
              item
              xs={3}
            >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="End Time"
                  onChange={handleEndDateChange}
                  value={dayjs.utc(formik.values.end || new Date())}
                  timezone={timezone}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>

          <TextField
            error={!!(formik.touched.status && formik.errors.status)}
            fullWidth
            helperText={formik.touched.status && formik.errors.status}
            label="Status"
            name="status"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.status}
            select
          >
            {Object.values(Status).map((statusKey) => (
              <MenuItem
                key={statusKey}
                value={statusKey}
              >
                <SeverityPill color={statusMap[statusKey] || statusMap.PENDING}>
                  {statusKey}
                </SeverityPill>
              </MenuItem>
            ))}
          </TextField>
        </Stack>
        <Divider />
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          spacing={1}
          sx={{ p: 2 }}
        >
          {event && event.type !== 'BlockedSlot' && (
            <IconButton
              onClick={(): Promise<void> => handleDelete()}
              disabled={isLoading}
            >
              <SvgIcon>
                <Trash02Icon />
              </SvgIcon>
            </IconButton>
          )}
          <Stack
            alignItems="center"
            direction="row"
            spacing={1}
          >
            <Button
              color="inherit"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              disabled={formik.isSubmitting || isLoading || event?.type === 'BlockedSlot'}
              type="submit"
              variant="contained"
            >
              Confirm
              {formik.isSubmitting && (
                <CircularProgress
                  sx={{ ml: 1 }}
                  size={20}
                />
              )}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Dialog>
  );
};

CalendarEventDialog.propTypes = {
  action: PropTypes.oneOf<Action>(['create', 'update']),
  // @ts-ignore
  event: PropTypes.object,
  onAddComplete: PropTypes.func,
  onClose: PropTypes.func,
  onDeleteComplete: PropTypes.func,
  onEditComplete: PropTypes.func,
  open: PropTypes.bool,
  // @ts-ignore
  range: PropTypes.object,
};
