import { publicProcedure } from '../../trpc';
import z from 'zod';
import prisma from 'src/libs/prisma';
import { sendPatientAppointmentReminderEmail } from 'src/utils/send-mail';
import dayjs from 'dayjs';
import { ConsultationSelect, ConsultationTrpcResponse } from './index';
import { AppointmentReminderType, Status } from '@prisma/client';
import { sendAppointmentSmsReminder } from 'src/utils/send-sms/appointment-reminder';

export const sendConsultationReminder = publicProcedure
  .input(
    z.object({
      consultationId: z.string(),
      hoursBefore: z.number(),
      type: z.nativeEnum(AppointmentReminderType),
    })
  )
  .mutation(async ({ input }) => {
    const consultation = await prisma.consultation.findUniqueOrThrow({
      where: {
        id: input.consultationId,
      },
      select: ConsultationSelect,
    }) as ConsultationTrpcResponse;

    const availability = await prisma.availability.findFirst({
      where: {
        user_id: consultation.staffs?.[0]?.staff_id,
      },
    });

    const timezone = availability?.timezone || dayjs.tz.guess();

    if (input.type === AppointmentReminderType.EMAIL) {
      await sendPatientAppointmentReminderEmail(consultation, timezone);
    }

    if (input.type === AppointmentReminderType.SMS) {
      await sendAppointmentSmsReminder(consultation, timezone, input.hoursBefore);
    }

    const appointmentReminder = await prisma.appointmentReminder.findFirst({
      where: {
        consultation_id: consultation.id,
        hours_before: input.hoursBefore,
        type: input.type,
      },
    });

    if (appointmentReminder) {
      await prisma.appointmentReminder.update({
        where: {
          id: appointmentReminder.id,
        },
        data: {
          status: Status.COMPLETED,
        },
      });
    }

    return 'success';
  });
