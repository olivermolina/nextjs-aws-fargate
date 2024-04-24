import { JWT_EXPIRES_IN, JWT_SECRET, sign } from '../jwt';
import { getBaseUrl } from '../get-base-url';
import sendgrid from '../../libs/sendgrid';
import { User } from '@prisma/client';

export const sendStaffWelcomeEmail = async (staff: User) => {
  const token = sign({ userId: staff.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const verificationLink = getBaseUrl() + '/verify?token=' + token;
  const encodedLink = encodeURI(verificationLink);
  const templateId = 'd-b07f19fe33204bd192bd6f58385e1ebb';
  try {
    await sendgrid.send({
      from: 'contact@lunahealth.app',
      templateId,
      personalizations: [
        {
          to: staff.email,
          dynamicTemplateData: {
            link: encodedLink,
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
