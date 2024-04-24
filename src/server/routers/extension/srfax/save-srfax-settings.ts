import { isAuthenticated } from '../../middleware/isAuthenticated';
import prisma from '../../../../libs/prisma';
import { JWT_SECRET, sign } from '../../../../utils/jwt';
import { SrFaxValidationSchema } from '../../../../utils/zod-schemas/srfax';

export const saveSrFaxSettings = isAuthenticated
  .input(SrFaxValidationSchema)
  .mutation(async ({ input, ctx }) => {
    // Create the access token
    const accessToken = sign(
      {
        account_number: input.account_number,
        access_password: input.access_password,
      },
      JWT_SECRET,
      { expiresIn: '9999 years' },
    );

    // Create a view of the account number
    // Example: 24566245 Outputs: 245xxxxx
    const accountNumberView = input.account_number
      .slice(0, 3)
      .padEnd(input.account_number.length, 'x');

    return prisma.sRFaxSettings.upsert({
      where: {
        organization_id: ctx.user.organization_id,
      },
      update: {
        account_number: accountNumberView,
        fax_number: input.fax_number,
        access_token: accessToken,
      },
      create: {
        account_number: accountNumberView,
        fax_number: input.fax_number,
        access_token: accessToken,
        organization: {
          connect: {
            id: ctx.user.organization_id,
          },
        },
      },
    });
  });
