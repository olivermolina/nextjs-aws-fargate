import { Patient } from '../../types/patient';
import { getBaseUrl } from '../get-base-url';
import sendgrid from '../../libs/sendgrid';
import { JWT_EXPIRES_IN, JWT_SECRET, sign } from '../jwt';

export const sendPatientCustomizeWelcomeEmail = async (input: {
  patient: Patient;
  body: string;
  subject: string;
  to: string;
}) => {
  const token = sign({ userId: input.patient.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  console.log({ token });
  try {
    const personalizations = [
      {
        to: input.to,
        dynamicTemplateData: {
          clinic_name: input.patient.organization.name,
          message_text: input.body,
          link: getBaseUrl() + '/onboard?token=' + token,
        },
      },
    ];
    await sendgrid.send({
      from: 'contact@lunahealth.app',
      templateId: 'd-ac60c9503ea44c18a52c0bd53c526fc8',
      personalizations,
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
