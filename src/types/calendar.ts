import { Status, User } from '@prisma/client';

type CalendarUserFields =
  | 'id'
  | 'first_name'
  | 'last_name'
  | 'avatar'
  | 'avatar_color'
  | 'email'
  | 'organization_id';

export type CalendarPatient = Pick<User, CalendarUserFields>;
export type CalendarStaff = Pick<User, CalendarUserFields>;

export interface CalendarEvent {
  id: string;
  allDay: boolean;
  color?: string;
  description: string;
  end: number;
  start: number;
  title?: string;
  staffs: CalendarStaff[];
  patient: CalendarPatient[];
  telemedicine: boolean;
  status: Status;
  backgroundColor?: string;
  serviceId: string;
  type?: 'consultation' | 'BlockedSlot';
  locationId?: string;
}

export type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';
