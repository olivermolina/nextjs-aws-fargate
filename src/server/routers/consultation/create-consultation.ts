import { publicProcedure } from '../../trpc';
import z from 'zod';
import { PatientValidationSchema } from 'src/types/patient';
import { LogAction, Status, UserType } from '@prisma/client';
import prisma from 'src/libs/prisma';
import { createUniqueUsername } from 'src/utils/create-unique-username';
import dayjs from 'dayjs';
import { ConsultationSelect, ConsultationTrpcResponse } from './index';
import { sendAppointmentNotification } from './send-appointment-notification';
import { createInvoiceOnCompletedStatus } from './create-invoice-on-completed-status';
import {
  pushEventsToGoogleCalendar,
} from '../../../utils/google-calendar/push-events-to-google-calendar';
import { addNotification } from '../notification/addNotification';
import dailyCoApiClient from '../../../libs/daily-co';

export const createConsultation = publicProcedure
  .input(
    z.object({
      user_id: z.string().optional().nullable(),
      user: PatientValidationSchema.and(
        z.object({
          timezone: z.string(),
        })
      )
        .optional()
        .nullable(),
      organization_id: z.string(),
      staffs_ids: z.array(z.string()),
      status: z.nativeEnum(Status),
      description: z.string(),
      start_time: z.string(),
      end_time: z.string(),
      transcription: z.string().optional(),
      external_notes: z.string().optional(),
      motive: z.string().optional(),
      telemedicine: z.boolean(),
      service_id: z.string(),
      title: z.string().optional(),
      invoice_id: z.string().optional(),
      location_id: z.string().optional(),
      creator: z.enum(['staff', 'patient']),
    })
  )
  .mutation(async ({ input }) => {
    const { staffs_ids, creator, user, organization_id, location_id, ...rest } = input;

    let userId = input.user_id;

    if (user) {
      const userExist = await prisma.user.findFirst({
        where: {
          email: user.email,
          organization_id,
          type: UserType.PATIENT,
        },
      });

      if (userExist) {
        throw new Error('User already exist');
      }

      const { patient_notes, assignedStaffs, timezone, ...restUser } = user;

      const username = await createUniqueUsername(user);

      const newUser = await prisma.user.create({
        data: {
          ...restUser,
          organization_id,
          stytch_member_id: '',
          avatar: '',
          password_hash: '',
          active: false,
          type: UserType.PATIENT,
          username,
        },
      });

      if (newUser && assignedStaffs && Array.isArray(assignedStaffs) && assignedStaffs.length > 0) {
        await prisma.userStaffs.createMany({
          data: assignedStaffs.map((staffId) => ({
            userId: newUser.id,
            staffId: staffId,
          })),
        });
      }

      userId = newUser.id;
    }

    if (!userId) {
      throw new Error('User not found');
    }

    const availability = await prisma.availability.findFirst({
      where: {
        user_id: staffs_ids[0],
      },
    });

    const timezone = availability?.timezone || dayjs.tz.guess();
    const start_time = dayjs.tz(input.start_time, timezone);
    const end_time = dayjs.tz(input.end_time, timezone);

    const consultation = (await prisma.consultation.create({
      data: {
        ...rest,
        user_id: userId,
        patient_notes: user?.patient_notes || '',
        title: input.title || 'Consultation',
        start_time: start_time.toDate(),
        end_time: start_time
          .set('hour', end_time.get('h'))
          .set('minute', end_time.get('m'))
          .toDate(),
        staffs: {
          createMany: {
            data: staffs_ids.map((staffId) => ({
              staff_id: staffId,
            })),
          },
        },
        ...(location_id && {
          location_id,
        }),
      },
      select: ConsultationSelect,
    })) as ConsultationTrpcResponse;

    if (consultation) {
      sendAppointmentNotification(consultation, timezone);
      createInvoiceOnCompletedStatus(consultation);

      // Push events to Google Calendar if enabled in settings for staff member
      if (staffs_ids && staffs_ids.length > 0) {
        const staff = await prisma.user.findUnique({
          where: {
            id: staffs_ids[0],
          },
          include: {
            google_calendar_setting: true,
          },
        });

        // Push events
        if (staff?.google_calendar_setting?.push_calendar) {
          pushEventsToGoogleCalendar(staffs_ids[0], consultation.id);
        }
      }

      const userData = await prisma.user.findUniqueOrThrow({
        where: {
          id: userId,
        },
      });

      // Create notification
      const appointmentRequestEnabled = consultation.user.organization?.appointment_request_enabled;
      const description =
        appointmentRequestEnabled && creator === 'patient' && consultation.status === Status.PENDING
          ? 'requested an appointment'
          : 'scheduled an appointment';
      await addNotification({
        organizationId: userData.organization_id,
        toUserIds: creator === 'staff' ? [userId] : staffs_ids,
        notificationsCreateManyInput: {
          from_user_id: creator === 'staff' ? staffs_ids[0]! : userId,
          consultation_id: consultation.id,
          description: description,
        },
      });

      if (!consultation.video_room_id && consultation.telemedicine) {
        try {
          const response = await dailyCoApiClient.post('/rooms', {
            name: consultation.id,
            privacy: 'private',
            properties: {
              enable_recording: 'cloud',
              enable_chat: true,
              owner_only_broadcast: false,
            },
          });

          if (response.data.id) {
            await prisma.consultation.update({
              where: {
                id: consultation.id,
              },
              data: {
                video_room_id: response.data.id,
              },
            });
          }
        } catch (error) {
          console.error(error.message);
        }
      }
    }

    if (input.creator === 'staff') {
      await prisma.log.create({
        data: {
          user_id: consultation.user_id,
          text: `the appointment`,
          staff_id: staffs_ids[0]!,
          action: LogAction.CREATE,
          consultation_id: consultation.id,
        },
      });
    }

    return consultation;
  });
