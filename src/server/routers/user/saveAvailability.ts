import { isAuthenticated } from '../middleware/isAuthenticated';
import prisma from 'src/libs/prisma';
import { AvailabilityValidationSchema } from 'src/utils/zod-schemas/availability';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const saveAvailability = isAuthenticated
  .input(AvailabilityValidationSchema)
  .mutation(async ({ input, ctx }) => {
    if (!input.id) {
      return prisma.availability.create({
        data: {
          name: input.name,
          user_id: ctx.user.id,
          organization_id: input.organization_id || ctx.user.organization_id,
          timezone: input.timezone,
          availability_slots: {
            create: input.availabilitySlots?.flatMap((slot) =>
              slot.daySlots.map((daySlot) => ({
                start_time: daySlot.start_time,
                end_time: daySlot.end_time,
                day_of_week: slot.dayOfWeek,
              }))
            ),
          },
        },
      });
    }

    await prisma.availabilitySlot.deleteMany({
      where: {
        availability_id: input.id,
      },
    });

    return prisma.availability.update({
      where: {
        id: input.id,
      },
      data: {
        name: input.name,
        user_id: ctx.user.id,
        organization_id: input.organization_id || ctx.user.organization_id,
        timezone: input.timezone,
        ...(input.availabilitySlots?.length && {
          availability_slots: {
            createMany: {
              data:
                input.availabilitySlots?.flatMap((slot) =>
                  slot.daySlots.map((daySlot) => ({
                    start_time: dayjs.tz(daySlot.start_time, input.timezone).set('s', 0).toDate(),
                    end_time: dayjs.tz(daySlot.end_time, input.timezone).set('s', 0).toDate(),
                    day_of_week: slot.dayOfWeek,
                  }))
                ) || [],
            },
          },
        }),
      },
    });
  });

export default saveAvailability;
