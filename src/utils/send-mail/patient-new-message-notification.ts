import { getBaseUrl } from '../get-base-url';
import sendgrid from '../../libs/sendgrid';
import { getUserFullName } from '../get-user-full-name';
import { Organization, User } from '@prisma/client';

export const patientNewMessageNotification = async (
  staff: User & {
    organization: Organization;
  },
  patient: User,
  threadId: string,
) => {
  const templateId = 'd-5fffbfb3d2734959986afc858d82ddd0';
  try {
    await sendgrid.send({
      from: 'contact@lunahealth.app',
      templateId,
      personalizations: [
        {
          to: patient.email,
          dynamicTemplateData: {
            first_name: patient.first_name,
            clinic_name: staff.organization.name,
            practitioner_name: getUserFullName(staff),
            link: getBaseUrl() + '/patient/chat?threadKey=' + threadId,
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
