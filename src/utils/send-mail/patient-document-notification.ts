import { getUserFullName } from '../get-user-full-name';
import { getBaseUrl } from '../get-base-url';
import sendgrid from '../../libs/sendgrid';
import { User } from '@prisma/client';

type Input = {
  fileId: string;
  patient: User;
  staff: User;
  folderId: string;
  clinicName: string;
}

export const sendPatientDocumentNotification = async (input: Input) => {
  const templateId = 'd-c42d5e02916145a39d870c5d9a34644f';
  const { fileId, patient, staff, folderId, clinicName } = input;

  const dynamicTemplateData = {
    first_name: patient?.first_name,
    practitioner_name: getUserFullName(staff),
    clinic_name: clinicName,
    link: getBaseUrl() + `/patient/files?folderId=${folderId}&id=${fileId}`,
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
          to: patient.email,
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
