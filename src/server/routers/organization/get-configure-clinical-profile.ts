import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { ConfigureClinicalProfile } from '@prisma/client';

const getConfigureClinicalProfile = isAuthenticated.query(async ({ ctx }) => {
  const settings = await prisma.configureClinicalProfile.findFirst({
    where: {
      organization_id: ctx.user.organization_id,
    },
  });

  if (!settings) {
    return (await prisma.configureClinicalProfile.create({
      data: {
        organization_id: ctx.user.organization_id,
        vitals_subsections: [
          'height',
          'weight',
          'bmi',
          'blood_pressure',
          'temperature',
          'heart_rate',
          'respiratory_rate',
          'oxygen_saturation',
        ],
        history_subsections: [
          'family_history',
          'social_history',
          'past_medical_history',
          'past_surgical_history',
          'diet',
          'habits',
          'exercises',
          'other',
        ],
      },
    })) as ConfigureClinicalProfile;
  }

  return settings as ConfigureClinicalProfile;
});

export default getConfigureClinicalProfile;
