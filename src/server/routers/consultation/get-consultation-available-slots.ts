import { publicProcedure } from '../../trpc';
import z from 'zod';
import prisma from 'src/libs/prisma';
import dayjs, { Dayjs } from 'dayjs';
import { isTimeSlotAvailable } from 'src/utils/is-timeslot-available';
import { Availability, AvailabilitySlot, Service } from '@prisma/client';

export const getConsultationAvailableSlots = publicProcedure
  .input(
    z.object({
      serviceId: z.string(),
      date: z.date(),
      staffId: z.string().optional(),
      consultationId: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    let staffAvailability:
      | (Availability & {
          availability_slots: AvailabilitySlot[];
        })
      | null = null;

    let service: Service | null = null;
    if (input.consultationId) {
      const consultation = await prisma.consultation.findUnique({
        where: {
          id: input.consultationId,
        },
        include: {
          staffs: true,
          service: true,
        },
      });

      if (consultation) {
        const staff = await prisma.user.findUnique({
          where: {
            id: input.staffId || consultation.staffs[0].staff_id,
          },
          include: {
            organization: {
              include: {
                Availabilities: {
                  include: {
                    availability_slots: true,
                  },
                },
              },
            },
          },
        });

        if (staff) {
          staffAvailability = staff.organization.Availabilities.filter(
            (availability) => availability.user_id === staff.id,
          )?.[0];
        }

        service = consultation.service;
      }
    }

    if (input.serviceId) {
      const existingService = await prisma.service.findUnique({
        where: {
          id: input.serviceId,
        },
        include: {
          organization: {
            include: {
              Availabilities: {
                include: {
                  availability_slots: true,
                },
              },
            },
          },
        },
      });

      if (existingService) {
        staffAvailability = input.staffId
          ? existingService?.organization.Availabilities.filter(
              (availability) => availability.user_id === input.staffId
            )?.[0]
          : existingService?.organization.Availabilities[0];
        service = existingService;
      }
    }

    // Initialize the array of time slots
    const timeSlots: Record<
      'morning' | 'afternoon',
      {
        start: Dayjs;
        end: Dayjs;
      }[]
    > = {
      morning: [],
      afternoon: [],
    };

    // Return the empty array if the staff availability or service is not found
    if (!staffAvailability || !service) {
      return timeSlots;
    }

    const date = dayjs(input.date).tz(staffAvailability.timezone);
    const dayOfWeek = date.get('day');
    const daySlots = staffAvailability.availability_slots.filter(
      (timeSlot) => timeSlot.day_of_week === dayOfWeek
    );

    if (daySlots.length === 0) {
      return timeSlots;
    }

    const dateInputFrom = date.utc().add(-1, 'day');
    const dateInputTo = date.utc().add(1, 'day');

    const existingConsultations = await prisma.consultation.findMany({
      where: {
        ...(input.consultationId && {
          NOT: {
            id: input.consultationId,
          },
        }),
        user: {
          organization_id: service.organization_id,
        },
        start_time: {
          gte: dateInputFrom.toDate(),
        },
        end_time: {
          lte: dateInputTo.toDate(),
        },
      },
    });

    const blockdeSlots = await prisma.blockedSlot.findMany({
      where: {
        user_id: staffAvailability.user_id,
        start_time: {
          gte: dateInputFrom.toDate(),
        },
        end_time: {
          lte: dateInputTo.toDate(),
        },
      },
    });

    const durationInMilliseconds = (service.duration || 30) * 60 * 1000; // 30 minutes by default

    const morningThreshold = 12; // 12 PM
    for (let daySlot of daySlots) {
      // Loop through the time range and add available time slots

      const startDaySlot = dayjs(daySlot.start_time).tz(staffAvailability.timezone);
      const endDaySLot = dayjs(daySlot.end_time).tz(staffAvailability.timezone);

      let currentDateTime = date
        .set('hour', startDaySlot.get('hour'))
        .set('minute', startDaySlot.get('minute'));
      let endDateTime = date
        .set('hour', endDaySLot.get('hour'))
        .set('minute', endDaySLot.get('minute'));

      while (
        currentDateTime.toDate().getTime() + durationInMilliseconds <=
        endDateTime.toDate().getTime()
      ) {
        const start = currentDateTime;
        const end = currentDateTime.add(durationInMilliseconds, 'ms');
        const period =
          dayjs(currentDateTime).tz(staffAvailability.timezone).get('hour') < morningThreshold
            ? 'morning'
            : 'afternoon';

        const isAvailable = isTimeSlotAvailable(
          start,
          end,
          existingConsultations,
          staffAvailability.timezone,
          blockdeSlots,
        );

        const existingTimeSlot = timeSlots[period].find(
          (timeSlot) => timeSlot.start.format('hh:mm A') === start.format('hh:mm A')
        );

        const currentTime = dayjs().tz(staffAvailability.timezone);
        const isAfter = date.isSame(currentTime, 'date')
          ? dayjs(start).isAfter(currentTime, 'h')
          : true;
        // Add the time slot if it's available and not already added
        // to the array of time slots and if it's in the future (not in the past)
        if (isAvailable && !existingTimeSlot && isAfter) {
          timeSlots[period].push({
            start,
            end,
          });
        }

        // Increment the current date time by the duration
        currentDateTime = currentDateTime.add(durationInMilliseconds, 'ms');
      }
    }

    return timeSlots;
  });
