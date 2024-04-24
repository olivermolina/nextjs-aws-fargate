import { AvailabilitySlot } from '@prisma/client';
import dayjs from 'dayjs';
import sortBy from 'lodash/sortBy';

export function getAvailableTimeSlots(availabilitySlots: AvailabilitySlot[] | null) {
  if (!availabilitySlots) {
    return {
      from: null,
      to: null,
    };
  }

  const dayOfWeek = dayjs().get('day');
  const todayTimeSlots = availabilitySlots.filter((timeSlot) => timeSlot.day_of_week === dayOfWeek);

  const todayTimeSlotsStart = sortBy(todayTimeSlots, 'start_time').map(
    (timeSlot) => timeSlot.start_time
  )[0];
  const todayTimeSlotsEnd = sortBy(todayTimeSlots, 'end_time')
    .map((timeSlot) => timeSlot.end_time)
    .pop();

  return {
    from: dayjs(todayTimeSlotsStart).format('hh:mm A'),
    to: dayjs(todayTimeSlotsEnd).format('hh:mm A'),
  };
}
