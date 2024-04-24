import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import prisma from 'src/libs/prisma';
import { sendPatientCustomizeWelcomeEmail } from 'src/utils/send-mail';
import { Patient } from 'src/types/patient';
import { userSelect } from './listUsers';

/**
 * Send patient welcome email using sendgrid
 * @param id - The patient id
 * @param to - The patient email
 * @param body - The email body
 * @returns The email response
 **/
const sendPatientWelcomeEmail = isAuthenticated
  .input(
    z.object({
      id: z.string(),
      to: z.string(),
      body: z.string(),
      subject: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const { id, ...restInput } = input;
    const patient = await prisma.user.findUnique({
      where: {
        id,
      },
      select: userSelect,
    });

    return await sendPatientCustomizeWelcomeEmail({
      ...restInput,
      patient: patient as Patient,
    });
  });

export default sendPatientWelcomeEmail;
