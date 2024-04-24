import { getBaseUrl } from '../get-base-url';
import sendgrid from '../../libs/sendgrid';
import { getUserFullName } from '../get-user-full-name';
import { paths } from '../../paths';
import { User } from '@prisma/client';

export const staffNewMessageNotification = async (
  staff: User,
  patient: User,
  threadId: string,
) => {
  const templateId = 'd-adea97a7d0604250802b2bf81f5bb436';
  try {
    await sendgrid.send({
      from: 'contact@lunahealth.app',
      templateId,
      personalizations: [
        {
          to: staff.email,
          dynamicTemplateData: {
            first_name: staff.first_name,
            patient_name: getUserFullName(patient),
            link: getBaseUrl() + paths.dashboard.chat + '?threadKey=' + threadId,
          },
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
