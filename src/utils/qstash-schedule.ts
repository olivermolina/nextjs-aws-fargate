import { AppointmentReminderType, Consultation, Status } from '@prisma/client';
import dayjs from 'dayjs';
import { qstashRequest } from '../libs/qstash';
import prisma from '../libs/prisma';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Schedule a qstash cron job to notify patient hours before the consultation starts
 * @param constultation
 * @param hoursBefore
 * @param type
 *
 * @returns scheduleId
 */
export const scheduleQstashCron = async (
  constultation: Consultation,
  hoursBefore: number,
  type: AppointmentReminderType
) => {
  const constultationUtc = dayjs(constultation.start_time).utc();
  const nowUtc = dayjs().utc();

  if (constultationUtc.isBefore(nowUtc, 'h')) {
    console.error('Cannot schedule qstash cron for past consultations');
    return;
  }

  const remainingTime = constultationUtc.diff(nowUtc, 'h'); // Remaining time in hours

  if (remainingTime < hoursBefore) {
    console.error(
      `Cannot schedule qstash cron for consultations that are less than the ${hoursBefore} hours before`
    );

    return;
  }

  const delayInMinutes = constultationUtc.subtract(hoursBefore, 'h').diff(nowUtc, 'minutes');

  const appointmentReminder = await prisma.appointmentReminder.findFirst({
    where: {
      consultation_id: constultation.id,
      hours_before: hoursBefore,
      type,
    },
  });

  if (appointmentReminder) {
    console.info('-----Deleting existing qstash message');
    const response = await qstashRequest({
      method: 'DELETE',
      url: `v2/messages/${appointmentReminder.qstash_schedule_id}`,
    });

    const { errors, data } = response;
    if (errors) {
      console.error(errors);
    }

    console.info('-----Qstash message deleted', { data });

    console.info('Deleting existing appointment reminder qstash cron');
    await prisma.appointmentReminder.delete({
      where: {
        id: appointmentReminder.id,
      },
    });
  }

  if(constultation.status === Status.COMPLETED || constultation.status === Status.CANCELED) {
    console.info('Cannot schedule qstash cron for completed or canceled consultations');
    return null;
  }

  const destination = 'https://admin.lunahealth.app/api/qstash-endpoint';

  const response = await qstashRequest({
    url: `v2/publish/${destination}`,
    method: 'POST',
    headers: {
      'Upstash-Method': 'POST',
      'Upstash-Delay': `${delayInMinutes}m`,
    },
    data: {
      consultationId: constultation.id,
      hoursBefore,
      type,
    },
  });

  const { errors, data } = response;

  if (errors) {
    console.error(errors);
  }

  if (!data) {
    console.error('No data returned from qstash');
    return null;
  }

  console.log({ data });

  await prisma.appointmentReminder.create({
    data: {
      consultation_id: constultation.id,
      qstash_schedule_id: data.messageId,
      hours_before: hoursBefore,
      type,
    },
  });

  return data?.messageId;
};
