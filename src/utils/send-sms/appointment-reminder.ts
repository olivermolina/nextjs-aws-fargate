import { ConsultationTrpcResponse } from 'src/server/routers/consultation';
import dayjs from 'dayjs';
import { getUserFullName } from '../get-user-full-name';
import axios from 'axios';
import { generateDailyRoomToken } from '../../server/routers/consultation/get-daily-room-token';

export const sendAppointmentSmsReminder = async (
  consultation: ConsultationTrpcResponse,
  timezone: string,
  hoursBefore: number
) => {
  if (!consultation.user.phone) {
    throw Error('Invalid phone number.');
  }

  const firstName = consultation.user.first_name;
  const eventDate = dayjs(consultation.start_time).tz(timezone);
  const staff = consultation.staffs?.[0]?.staff;
  let text = `Hello ${firstName}. This is a reminder that you have an appointment at ${eventDate.format(
    'hh:mm A',
  )} ${hoursBefore === 24 ? 'tomorrow' : 'today'} with ${
    staff?.abbreviation || 'Dr.'
  } ${getUserFullName(staff)}. Login to https://lunahealth.app/login to see more details. `;
  if (consultation.telemedicine) {
    const result = await generateDailyRoomToken(consultation.id, false);
    text += `Please connect to the video call using this link at the scheduled time: https://lunahealth.daily.co/${consultation.id}?t=${result?.token}`;
  }

  let data = JSON.stringify({
    receiver: {
      contacts: [
        {
          // assuming all phone numbers are CA/US numbers
          identifierValue: `+1${consultation.user.phone}`,
        },
      ],
    },
    body: {
      type: 'text',
      text: {
        text,
      },
    },
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    // TODO - move this to env
    url: 'https://nest.messagebird.com/workspaces/918eddc9-6093-4d73-8316-15b7691eabbd/channels/3123fa5d-cbbb-4f56-826a-b293fd2e69f4/messages',
    headers: {
      Authorization: `AccessKey ${process.env.MESSAGEBIRD_API_KEY}`,
      'Content-Type': 'application/json',
    },
    data: data,
  };

  axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
};
