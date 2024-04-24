import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import prisma from 'src/libs/prisma';
import { qstashRequest } from '../../../libs/qstash';
import dailyCoApiClient from '../../../libs/daily-co';
import { LogAction } from '@prisma/client';

export const deleteConsultation = isAuthenticated
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    await prisma.consultationStaff.deleteMany({ where: { consultation_id: input.id } });

    const appointmentReminders = await prisma.appointmentReminder.findMany({
      where: {
        consultation_id: input.id,
      },
    });

    if (appointmentReminders && appointmentReminders.length > 0) {
      Promise.all(
        appointmentReminders.map(async (appointmentReminder) => {
          console.info('-----Deleting existing qstash schedule');
          const response = await qstashRequest({
            method: 'DELETE',
            url: `v2/schedules/${appointmentReminder.qstash_schedule_id}`,
          });

          const { errors, data } = response;
          if (errors) {
            console.error(errors);
          }
          console.info('-----Qstash schedule deleted', { data });
        })
      );
    }

    await prisma.appointmentReminder.deleteMany({
      where: {
        consultation_id: input.id,
      },
    });

    const consultation = await prisma.consultation.delete({
      where: {
        id: input.id,
      },
    });

    // Remove the daily.co room if it exists
    if (consultation.video_room_id) {
      try {
        await dailyCoApiClient.delete(`/rooms/${consultation.id}`);
      } catch (error) {
        console.error(error.message);
      }
    }

    await prisma.log.create({
      data: {
        user_id: consultation.user_id,
        text: `the appointment`,
        staff_id: ctx.user.id,
        action: LogAction.DELETE,
        consultation_id: consultation.id,
      },
    });

    return consultation;
  });
