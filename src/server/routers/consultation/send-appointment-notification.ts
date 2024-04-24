import { ConsultationTrpcResponse } from './index';
import {
  sendPatientAppointmentCanceledNotificationEmail,
  sendPatientAppointmentNotificationEmail,
  sendPatientAppointmentRequestNotification,
  sendStaffAppointmentNotificationEmail,
  sendStaffAppointmentRequestNotification,
} from 'src/utils/send-mail';
import { scheduleQstashCron } from 'src/utils/qstash-schedule';
import { AppointmentReminderType, Status } from '@prisma/client';

export const sendAppointmentNotification = (
  consultation: ConsultationTrpcResponse,
  timezone: string,
) => {
  const organization = consultation.user.organization;

  // Send appointment request notification
  if (consultation.status === Status.PENDING && organization.appointment_request_enabled) {
    sendPatientAppointmentRequestNotification(consultation as ConsultationTrpcResponse, timezone);
    sendStaffAppointmentRequestNotification(consultation as ConsultationTrpcResponse, timezone);
  }

  // Send appointment notification
  if (
    consultation.status === Status.CONFIRMED ||
    (consultation.status === Status.PENDING && !organization.appointment_request_enabled)
  ) {
    sendPatientAppointmentNotificationEmail(consultation as ConsultationTrpcResponse, timezone);
    sendStaffAppointmentNotificationEmail(consultation as ConsultationTrpcResponse, timezone);
  }

  // Send appointment canceled notification
  if (consultation.status === Status.CANCELED) {
    sendPatientAppointmentCanceledNotificationEmail(
      consultation as ConsultationTrpcResponse,
      timezone,
    );
  }

  if (organization.reminders_day_before) {
    scheduleQstashCron(consultation as ConsultationTrpcResponse, 24, AppointmentReminderType.EMAIL);
  }

  if (organization.reminders_hour_before) {
    scheduleQstashCron(consultation as ConsultationTrpcResponse, 1, AppointmentReminderType.EMAIL);
  }

  if (organization.sms_reminders_day_before) {
    scheduleQstashCron(consultation as ConsultationTrpcResponse, 24, AppointmentReminderType.SMS);
  }

  if (organization.sms_reminders_hour_before) {
    scheduleQstashCron(consultation as ConsultationTrpcResponse, 1, AppointmentReminderType.SMS);
  }
};
