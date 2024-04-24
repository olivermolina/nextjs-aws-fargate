import { publicProcedure } from '../../trpc';
import z from 'zod';
import { LogAction, Status } from '@prisma/client';
import prisma from 'src/libs/prisma';
import dayjs from 'dayjs';
import { ConsultationSelect, ConsultationTrpcResponse } from './index';
import { sendAppointmentNotification } from './send-appointment-notification';
import { createInvoiceOnCompletedStatus } from './create-invoice-on-completed-status';
import {
  pushEventsToGoogleCalendar,
} from '../../../utils/google-calendar/push-events-to-google-calendar';

export const updateConsultation = publicProcedure
  .input(
    z.object({
      id: z.string(),
      user_id: z.string().optional(),
      staffs_ids: z.array(z.string()).optional(),
      status: z.nativeEnum(Status).optional(),
      description: z.string().optional(),
      start_time: z.string().optional(),
      end_time: z.string().optional(),
      transcription: z.string().optional(),
      external_notes: z.string().optional(),
      motive: z.string().optional(),
      telemedicine: z.boolean().optional(),
      service_id: z.string().optional(),
      location_id: z.string().optional(),
      updated_by: z.enum(['staff', 'patient']).optional(),
    })
  )
  .mutation(async ({ input }) => {
    const { staffs_ids, location_id, id, ...rest } = input;

    const oldConsultation = await prisma.consultation.findUnique({
      where: {
        id: input.id,
      },
      include: {
        staffs: true,
      },
    });

    const staffId = input.staffs_ids?.[0] || oldConsultation?.staffs?.[0]?.staff_id;

    const availability = await prisma.availability.findFirst({
      where: {
        user_id: staffId,
      },
    });

    const start_time = dayjs.tz(input.start_time, availability?.timezone);
    const end_time = dayjs.tz(input.end_time, availability?.timezone);
    const timezone = availability?.timezone || dayjs.tz.guess();

    const consultation = (await prisma.consultation.update({
      where: {
        id,
      },
      data: {
        ...rest,
        ...(input.start_time && { start_time: start_time.toDate() }),
        ...(input.end_time && {
          end_time: start_time
            .set('hour', end_time.get('h'))
            .set('minute', end_time.get('m'))
            .toDate(),
        }),
        ...(staffs_ids && {
          staffs: {
            deleteMany: {
              consultation_id: id,
              NOT: {
                staff_id: {
                  in: staffs_ids,
                },
              },
            },
            connectOrCreate: staffs_ids.map((staffId) => ({
              where: {
                consultation_id_staff_id: {
                  consultation_id: id,
                  staff_id: staffId,
                },
              },
              create: {
                staff_id: staffId,
              },
            })),
          },
        }),
        ...(input.service_id && {
          service_id: input.service_id,
        }),
        ...(input.location_id && {
          location_id: input.location_id,
        }),
      },
      select: ConsultationSelect,
    })) as ConsultationTrpcResponse;

    if (consultation) {
      // Mark notifications as read if the appointment is not pending
      if (input.status !== Status.PENDING) {
        await prisma.notification.updateMany({
          where: {
            consultation_id: id,
          },
          data: {
            read: true,
          },
        });
      }

      sendAppointmentNotification(consultation, timezone);
      await createInvoiceOnCompletedStatus(consultation);

      // Push events to Google Calendar if enabled in settings for staff member
      if (staffId) {
        const staff = await prisma.user.findUnique({
          where: {
            id: staffId,
          },
          include: {
            google_calendar_setting: true,
          },
        });

        // Push events
        if (staff?.google_calendar_setting?.push_calendar) {
          pushEventsToGoogleCalendar(staffId, consultation.id);
        }
      }
    }

    if (input.updated_by === 'staff' && input.staffs_ids) {
      await prisma.log.create({
        data: {
          user_id: consultation.user_id,
          text: `the appointment`,
          staff_id: input.staffs_ids[0]!,
          action: LogAction.EDIT,
          consultation_id: consultation.id,
        },
      });
    }

    return consultation;
  });
