import { ConsultationTrpcResponse } from '../../server/routers/consultation';
import dayjs from 'dayjs';
import { getUserFullName } from '../get-user-full-name';
import { getBaseUrl } from '../get-base-url';
import { paths } from '../../paths';
import sendgrid from '../../libs/sendgrid';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const sendPatientAppointmentCanceledNotificationEmail = async (
  consultation: ConsultationTrpcResponse,
  timezone: string,
) => {
  const templateId = 'd-6b3aa59a87b744af9ee97d4e403a84c6';
  const staff = consultation.staffs?.[0]?.staff;
  const abbreviation = staff?.abbreviation || 'Dr.';
  const eventDate = dayjs(consultation.start_time).tz(timezone);

  const dynamicTemplateData = {
    appointment_date: eventDate.format('MM/DD/YYYY'),
    appointment_time: eventDate.format('hh:mm A'),
    abbreviation,
    staff_name: getUserFullName(staff),
    clinic_name: staff?.organization.name,
    appointment_description: consultation.description,
    login_link: getBaseUrl() + '/login',
    schedule_link:
      getBaseUrl() +
      paths.schedule.index.replace(':slug', staff?.username || staff?.organization.slug!),
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
