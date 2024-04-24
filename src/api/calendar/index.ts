import type { CalendarEvent, CalendarPatient } from 'src/types/calendar';
import { createResourceId } from 'src/utils/create-resource-id';
import { deepCopy } from 'src/utils/deep-copy';

import { data } from './data';
import { CalendarStaff } from 'src/types/calendar';
import { Status } from '@prisma/client';

type GetEventsRequest = object;

type GetEventsResponse = Promise<CalendarEvent[]>;

type CreateEventRequest = {
  description: string;
  end: number;
  start: number;
  title: string;
  telemedicine: boolean;
  staffs: CalendarStaff[];
  patient: CalendarPatient[];
  status: Status;
};

type CreateEventResponse = Promise<CalendarEvent>;

type UpdateEventRequest = {
  eventId: string;
  update: {
    description?: string;
    end?: number;
    start?: number;
    title?: string;
    telemedicine?: boolean;
    staffs?: CalendarStaff[];
    patient?: CalendarPatient[];
    status?: Status;
  };
};

type UpdateEventResponse = Promise<CalendarEvent>;

type DeleteEventRequest = {
  eventId: string;
};

type DeleteEventResponse = Promise<true>;

class CalendarApi {
  getEvents(request: GetEventsRequest = {}): GetEventsResponse {
    return Promise.resolve(deepCopy(data.events));
  }

  createEvent(request: CreateEventRequest): CreateEventResponse {
    const { description, end, start, title, telemedicine, status, staffs, patient } = request;

    return new Promise((resolve, reject) => {
      try {
        // Make a deep copy
        const clonedEvents = deepCopy(data.events) as CalendarEvent[];

        // Create the new event
        const event: CalendarEvent = {
          id: createResourceId(),
          allDay: false,
          description,
          end,
          start,
          title,
          telemedicine,
          staffs,
          patient,
          status,
          serviceId: '',
        };

        // Add the new event to events
        clonedEvents.push(event);

        resolve(deepCopy(event));
      } catch (err) {
        console.error('[Calendar Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }

  updateEvent(request: UpdateEventRequest): UpdateEventResponse {
    const { eventId, update } = request;

    return new Promise((resolve, reject) => {
      try {
        // TODO updateEvent event
      } catch (err) {
        console.error('[Calendar Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }

  deleteEvent(request: DeleteEventRequest): DeleteEventResponse {
    const { eventId } = request;

    return new Promise((resolve, reject) => {
      try {
        // TODO delete event

        resolve(true);
      } catch (err) {
        console.error('[Calendar Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }
}

export const calendarApi = new CalendarApi();
