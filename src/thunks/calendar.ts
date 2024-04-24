import { calendarApi } from 'src/api/calendar';
import { slice } from 'src/slices/calendar';
import type { AppThunk } from 'src/store';
import trpcClient from 'src/libs/trpc';
import dayjs from 'dayjs';
import { BlockedSlot, Status, User } from '@prisma/client';
import { CalendarEvent, CalendarPatient, CalendarStaff } from 'src/types/calendar';
import toast from 'react-hot-toast';
import type { ConsultationTrpcResponse } from 'src/server/routers/consultation';

export function mapConsultationToCalendarEvent(
  consultation: ConsultationTrpcResponse,
): CalendarEvent {
  return {
    id: consultation.id,
    title: consultation.user.first_name + ' ' + consultation.user.last_name,
    description: consultation.description || '',
    telemedicine: consultation.telemedicine,
    patient: [consultation.user],
    staffs: consultation.staffs.map((consultationStaff) => consultationStaff.staff!),
    start: dayjs(consultation.start_time).toDate().getTime(),
    end: dayjs(consultation.end_time)
      .set('date', dayjs(consultation.start_time).get('date'))
      .set('hour', dayjs(consultation.end_time).get('hour'))
      .set('minute', dayjs(consultation.end_time).get('minute'))
      .toDate()
      .getTime(),
    allDay: false,
    status: consultation.status,
    backgroundColor: consultation.staffs[0]?.staff?.avatar_color || '',
    serviceId: consultation.service_id || '',
    locationId: consultation.location_id || '',
  };
}

function mapBlockedSlotToCalendarEvent(blockSLot: BlockedSlot & { user: User }): CalendarEvent {
  return {
    id: blockSLot.id,
    title: 'Busy',
    description: '',
    telemedicine: false,
    patient: [],
    staffs: [blockSLot.user],
    start: dayjs(blockSLot.start_time).toDate().getTime(),
    end: dayjs(blockSLot.end_time)
      .set('date', dayjs(blockSLot.start_time).get('date'))
      .set('hour', dayjs(blockSLot.end_time).get('hour'))
      .set('minute', dayjs(blockSLot.end_time).get('minute'))
      .toDate()
      .getTime(),
    allDay: false,
    status: Status.PENDING,
    backgroundColor: blockSLot.user?.avatar_color || '',
    serviceId: '',
    type: 'BlockedSlot',
    locationId: '',
  };
}

const getEvents =
  (
    date: Date,
    selectedStaffs: Record<string, boolean>,
    selectedServices: Record<string, boolean>,
    selectedLocations: Record<string, boolean>,
  ): AppThunk =>
    async (dispatch): Promise<void> => {
      dispatch(slice.actions.setIsLoading(true));

      // Get all selected staffs that are true
      const filterStaffIds = Object.keys(selectedStaffs).filter((staffId) => selectedStaffs[staffId]);
      const filterServices = Object.keys(selectedServices).filter(
        (serviceId) => selectedServices[serviceId],
      );
      const filterLocationIds = Object.keys(selectedLocations).filter(
        (locationId) => selectedLocations[locationId],
      );

      const telemedicine = filterLocationIds.includes('telemedicine');

      const response = await trpcClient().consultation.list.query({
        rowsPerPage: 1000,
        page: 0,
        from: dayjs(date).startOf('month').toISOString(),
        to: dayjs(date).endOf('month').toISOString(),
        ...(filterServices &&
          filterServices.length > 0 && { service_ids: filterServices.filter((id) => id !== 'all') }),
        ...(filterStaffIds &&
          filterStaffIds.length > 0 && { staff_ids: filterStaffIds.filter((id) => id !== 'all') }),
        ...(filterLocationIds &&
          filterLocationIds.length > 0 && {
            location_ids: filterLocationIds.filter((id) => id !== 'telemedicine' && id !== 'all'),
          }),
        ...(telemedicine && { telemedicine }),
      });

      const events = response.items.map((consultation) =>
        mapConsultationToCalendarEvent(consultation as unknown as ConsultationTrpcResponse),
      );

      const blockedSlotsResponse = await trpcClient().consultation.blockedSlots.query({
        from: dayjs(date).startOf('month').toISOString(),
        to: dayjs(date).endOf('month').toISOString(),
      });

      const blockedEvents = blockedSlotsResponse.map(mapBlockedSlotToCalendarEvent);

      dispatch(slice.actions.getEvents([...events, ...blockedEvents]));
      dispatch(slice.actions.setIsLoading(false));
    };

type CreateEventParams = {
  allDay: boolean;
  description: string;
  end: number;
  start: number;
  title: string;
  telemedicine: boolean;
  staffs: CalendarStaff[];
  patient: CalendarPatient[];
  status: Status;
  serviceId: string;
  creator: 'patient' | 'staff';
  locationId?: string;
};

const createEvent =
  (params: CreateEventParams): AppThunk =>
    async (dispatch): Promise<void> => {
      try {
        const consultation = await trpcClient().consultation.create.mutate({
          user_id: params.patient[0].id,
          organization_id: params.patient[0].organization_id,
          staffs_ids: params.staffs.map((staff) => staff.id),
          status: params.status,
          description: params.description,
          start_time: dayjs(new Date(params.start)).format('YYYY-MM-DD HH:mm:ss'),
          end_time: dayjs(new Date(params.end)).format('YYYY-MM-DD HH:mm:ss'),
          telemedicine: params.telemedicine,
          service_id: params.serviceId,
          creator: params.creator,
          location_id: params.locationId,
        });

        if (consultation) {
          dispatch(
            slice.actions.createEvent(
              mapConsultationToCalendarEvent(consultation as unknown as ConsultationTrpcResponse),
            ),
          );

          toast.success('Event successfully created.');
        }
      } catch (e) {
        toast.error('Couldn\'t create event.');
      }
    };

type UpdateEventParams = {
  eventId: string;
  update: {
    allDay?: boolean;
    description?: string;
    end?: number;
    start?: number;
    title?: string;
    telemedicine?: boolean;
    staffs?: CalendarStaff[];
    patient?: CalendarPatient[];
    status?: Status;
    serviceId?: string;
    locationId?: string;
  };
};

const updateEvent =
  (params: UpdateEventParams): AppThunk =>
    async (dispatch): Promise<void> => {
      try {
        const consultation = await trpcClient().consultation.update.mutate({
          id: params.eventId,
          user_id: params.update.patient?.[0].id,
          staffs_ids: params.update.staffs?.map((staff) => staff.id),
          status: params.update.status,
          telemedicine: params.update.telemedicine,
          description: params.update.description,
          ...(params.update.start && {
            start_time: dayjs(new Date(params.update.start)).format('YYYY-MM-DD HH:mm:ss'),
          }),
          ...(params.update.end && {
            end_time: dayjs(new Date(params.update.end)).format('YYYY-MM-DD HH:mm:ss'),
          }),
          service_id: params.update.serviceId,
          location_id: params.update.locationId,
        });

        if (consultation) {
          dispatch(
            slice.actions.updateEvent(
              mapConsultationToCalendarEvent(consultation as unknown as ConsultationTrpcResponse),
            ),
          );

          toast.success('Event successfully updated.');
        }
      } catch (e) {
        console.log(e);
        toast.error('Couldn\'t update event.');
      }
    };

type DeleteEventParams = {
  eventId: string;
};

const deleteEvent =
  (params: DeleteEventParams): AppThunk =>
    async (dispatch): Promise<void> => {
      dispatch(slice.actions.setIsLoading(true));
      try {
        const consultation = await trpcClient().consultation.delete.mutate({
          id: params.eventId,
        });

        if (consultation) {
          dispatch(slice.actions.deleteEvent(params.eventId));
          toast.success('Event successfully deleted.');
        }
      } catch (e) {
        console.log(e);
        toast.error('Couldn\'t update event.');
      }

      dispatch(slice.actions.setIsLoading(false));
    };

const isLoading =
  (params: UpdateEventParams): AppThunk =>
    async (dispatch): Promise<void> => {
      const response = await calendarApi.updateEvent(params);

      dispatch(slice.actions.updateEvent(response));
    };

export const thunks = {
  isLoading,
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent,
};
