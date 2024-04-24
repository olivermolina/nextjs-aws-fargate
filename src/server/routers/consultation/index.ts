import { t } from 'src/server/trpc';
import {
  Address,
  Chart,
  Consultation,
  ConsultationStaff,
  Invoice,
  Organization,
  Prisma,
  StripePaymentMethod,
  StripeUserPaymentMethod,
  User,
  Location,
} from '@prisma/client';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { getConsultation } from './get-consultation';
import { consultationList } from './list';
import { createConsultation } from './create-consultation';
import { updateConsultation } from './update-consultation';
import { deleteConsultation } from './delete-consultation';
import { getConsultationAvailableSlots } from './get-consultation-available-slots';
import { sendConsultationReminder } from './send-consultation-reminder';
import { ServiceWithStaff } from '../../../types/service';
import { blockedSlots } from './blocked-slots';
import { countsByDateRange } from './counts-by-date-range';
import createConsultationInvoice from './create-consultation-invoice';
import { videoCallStarted } from './video-call-started';
import { getDailyRoomToken } from './get-daily-room-token';
import { dailyProcessedJob } from './daily-processed-job';
import { dailyBatchProcessor } from './daily-batch-processor';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

export const ConsultationSelect = Prisma.validator<Prisma.ConsultationSelect>()({
  id: true,
  user_id: true,
  description: true,
  start_time: true,
  end_time: true,
  created_at: true,
  updated_at: true,
  diagnostic_code: true,
  motive: true,
  status: true,
  internal_notes: true,
  external_notes: true,
  transcription: true,
  telemedicine: true,
  service_id: true,
  title: true,
  patient_notes: true,
  service: true,
  user: {
    include: {
      address: true,
      organization: true,
      StripeUserPaymentMethods: {
        include: {
          stripe_payment_method: true,
        },
      },
    },
  },
  staffs: {
    include: {
      staff: {
        include: {
          address: true,
          organization: true,
          StripeUserPaymentMethods: true,
        },
      },
    },
  },
  invoice: true,
  google_calendar_event_id: true,
  video_room_id: true,
  Charts: true,
  video_call_started_at: true,
  location_id: true,
  location: true,
});

type UserWithAddress = User & {
  address: Address | null;
  organization: Organization;
  StripeUserPaymentMethods: (StripeUserPaymentMethod & {
    stripe_payment_method: StripePaymentMethod;
  })[];
};

export type ConsultationTrpcResponse = Consultation & {
  user: UserWithAddress;
  staffs: (ConsultationStaff & {
    staff:
      | (UserWithAddress & {
      organization: Organization;
    })
      | null;
  })[];
  service: ServiceWithStaff | null;
  invoice: Invoice | null;
  Charts: Chart[];
  location: Location | null;
};

const consultationRouter = t.router({
  list: consultationList,
  get: getConsultation,
  create: createConsultation,
  update: updateConsultation,
  delete: deleteConsultation,
  getConsultationAvailableSlots,
  sendConsultationReminder,
  blockedSlots,
  countsByDateRange,
  createConsultationInvoice,
  videoCallStarted,
  getDailyRoomToken,
  dailyBatchProcessor,
  dailyProcessedJob,
});

export default consultationRouter;
