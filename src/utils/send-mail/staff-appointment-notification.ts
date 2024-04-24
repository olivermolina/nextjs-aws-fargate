import { ConsultationTrpcResponse } from '../../server/routers/consultation';

import * as ics from 'ics';
import { getUserFullName } from '../get-user-full-name';
import { getBaseUrl } from '../get-base-url';
import { paths } from '../../paths';
import sendgrid from '../../libs/sendgrid';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const sendStaffAppointmentNotificationEmail = async (
  consultation: ConsultationTrpcResponse,
  timezone: string
) => {
  const templateId = 'd-f9137ee80d4040acb4a712879040aa56';
  const staff = consultation.staffs?.[0]?.staff;
  const eventDate = dayjs(consultation.start_time).tz(timezone);
  const utcEventStartDate = dayjs(consultation.start_time);
  const utcEventEndDate = dayjs(consultation.end_time);
  const videoUrl = encodeURIComponent(`https://lunahealth.daily.co/${consultation.id}`);
  const fullVideoUrl = `${getBaseUrl()}/dashboard/customers/${
    consultation.user.id
  }?video_url=${videoUrl}`;
  const slug = consultation.user.organization?.slug || consultation.user.organization_id;
  let description = `To reschedule please make changes with the following link\n${getBaseUrl()}/schedule/${slug}/${
    consultation.id
  }`;
  if (consultation.telemedicine) {
    description += `\n\nAt the time of the call please connect using this link\n${fullVideoUrl}`;
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
    title: `Appointment with ${getUserFullName(consultation.user)}`,
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
      {
        name: getUserFullName(staff),
        email: staff!.email,
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
    patient_name: getUserFullName(consultation.user),
    clinic_name: staff?.organization.name,
    appointment_description: consultation.description,
    link: fullVideoUrl,
    login_link: getBaseUrl() + '/login',
    edit_link:
      getBaseUrl() +
      paths.schedule.id
        .replace(':id', consultation.id)
        .replace(':slug', staff?.organization?.slug!),
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
          to: staff?.email!,
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
