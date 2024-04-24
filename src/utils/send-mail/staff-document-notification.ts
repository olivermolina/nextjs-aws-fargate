import { getUserFullName } from '../get-user-full-name';
import { getBaseUrl } from '../get-base-url';
import sendgrid from '../../libs/sendgrid';
import { User } from '@prisma/client';

type Input = {
  fileId: string;
  patient: User;
  staff: User;
  folderId: string;
};

export const sendStaffDocumentNotification = async (input: Input) => {
  const templateId = 'd-457fca620c6449b294584c2c3beb8cfe';
  const { fileId, patient, staff, folderId } = input;

  const dynamicTemplateData = {
    first_name: staff?.first_name,
    patient_name: getUserFullName(patient),
    link: getBaseUrl() + `/dashboard/customers/${patient.id}?tab=files&folderId=${folderId}&id=${fileId}`,
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
          to: staff.email,
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
