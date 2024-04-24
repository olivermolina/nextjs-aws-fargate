import dayjs, { Dayjs } from 'dayjs';
import { BlockedSlot, Consultation } from '@prisma/client';

export const isTimeSlotAvailable = (
  start: Dayjs,
  end: Dayjs,
  existingConsultations: Consultation[],
  timezone: string,
  blockedSlots: BlockedSlot[],
) => {
  const consultationEvents = existingConsultations.map((consultation) => ({
    start_time: dayjs(consultation.start_time).tz(timezone),
    end_time: dayjs(consultation.end_time).tz(timezone),
  }));

  const blockedSlotsEvents = blockedSlots.map((blockedSlot) => ({
    start_time: dayjs(blockedSlot.start_time).tz(timezone),
    end_time: dayjs(blockedSlot.end_time).tz(timezone),
  }));

  for (let event of [...consultationEvents, ...blockedSlotsEvents]) {
    const startTime = dayjs(event.start_time).tz(timezone);
    const endTime = dayjs(event.end_time).tz(timezone);
    const isInRange =
      startTime.format('hh:mm A') === start.format('hh:mm A') ||
      start.isBetween(startTime, endTime, 'm', '[)') ||
      end.isBetween(startTime, endTime, 'm', '[)') ||
      end.isSame(endTime);
    if (isInRange) {
      return false;
    }
  }

  return true;
};
