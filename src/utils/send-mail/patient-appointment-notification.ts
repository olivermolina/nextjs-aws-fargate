import { ConsultationTrpcResponse } from '../../server/routers/consultation';
import dayjs from 'dayjs';
import * as ics from 'ics';
import { getUserFullName } from '../get-user-full-name';
import { getBaseUrl } from '../get-base-url';
import { paths } from '../../paths';
import sendgrid from '../../libs/sendgrid';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { generateDailyRoomToken } from '../../server/routers/consultation/get-daily-room-token';

dayjs.extend(utc);
dayjs.extend(timezone);

export const sendPatientAppointmentNotificationEmail = async (
  consultation: ConsultationTrpcResponse,
  timezone: string,
) => {
  const templateId = 'd-abc0a4ce5b9e45a3b93c3c3916a41784';
  const staff = consultation.staffs?.[0]?.staff;
  const abbreviation = staff?.abbreviation || 'Dr.';
  const eventDate = dayjs(consultation.start_time).tz(timezone);
  const utcEventStartDate = dayjs(consultation.start_time);
  const utcEventEndDate = dayjs(consultation.end_time);

  const slug = consultation.user.organization?.slug || consultation.user.organization_id;
  let description = `To reschedule please make changes with the following link\n${getBaseUrl()}/schedule/${slug}/${
    consultation.id
  }`;
  const result = await generateDailyRoomToken(consultation.id, false);
  const videoLink = `https://lunahealth.daily.co/${consultation.id}?t=${result?.token}`;
  if (consultation.telemedicine) {
    description += `\n\nAt the time of the call please connect using this link\n${videoLink}`;
  }

  const event = {
    startInputType: 'utc' as ics.EventAttributes['startInputType'],
    startOutputType: 'utc' as ics.EventAttributes['startOutputType'],
    start: [
      utcEventStartDate.year(),
      utcEventStartDate.month() + 1, // month is 0-indexed
      utcEventStartDate.date(),
      utcEventStartDate.hour(),
      utcEventStartDate.minute(),
    ] as ics.DateArray,
    endInputType: 'utc' as ics.EventAttributes['endInputType'],
    endOutputType: 'utc' as ics.EventAttributes['endOutputType'],
    end: [
      utcEventEndDate.year(),
      utcEventEndDate.month() + 1, // month is 0-indexed
      utcEventEndDate.date(),
      utcEventEndDate.hour(),
      utcEventEndDate.minute(),
    ] as ics.DateArray,
    title: `Appointment with ${abbreviation} ${getUserFullName(staff)}`,
    description,
    status: 'CONFIRMED' as ics.EventStatus,
    busyStatus: 'BUSY' as ics.EventAttributes['busyStatus'],
    attendees: [
      {
        name: getUserFullName(consultation.user),
        email: consultation.user.email,
        rsvp: true,
        partstat: 'ACCEPTED' as ics.ParticipationStatus,
        role: 'REQ-PARTICIPANT' as ics.ParticipationRole,
      },
    ],
    organizer: {
      name: getUserFullName(staff),
      email: 'contact@lunahealth.app',
    },
  };

  const { value } = ics.createEvent(event);

  const dynamicTemplateData = {
    appointment_date: eventDate.format('MM/DD/YYYY'),
    appointment_time: eventDate.format('hh:mm A'),
    abbreviation: 'Dr.',
    staff_name: getUserFullName(staff),
    clinic_name: staff?.organization.name,
    appointment_description: consultation.description,
    link: videoLink,
    login_link: getBaseUrl() + '/login',
    edit_link:
      getBaseUrl() +
      paths.schedule.id
        .replace(':id', consultation.id)
        .replace(':slug', staff?.username || staff?.organization.slug!),
  };

  try {
    await sendgrid.send({
      from: 'contact@lunahealth.app',
      templateId,
      content: [
        {
          type: 'text/plain',
          value: 'Plain Content',
        },
        {
          type: 'text/html',
          value: 'HTML Content',
        },
        {
          type: 'text/calendar; method=REQUEST',
          value: value!,
        },
      ],
      attachments: [
        {
          content: Buffer.from(value!).toString('base64'),
          type: 'application/ics',
          filename: 'invite.ics',
          disposition: 'attachment',
        },
      ],
      personalizations: [
        {
          to: consultation.user.email,
          dynamicTemplateData,
        },
      ],
    });
    return { code: 'success', message: 'Email has been successfully sent.' };
  } catch (e: any) {
    console.log(e.message);
    return {
      code: 'failed',
      message: e.response?.body || 'Email failed to be sent.',
    };
  }
};
