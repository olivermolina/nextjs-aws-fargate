import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import {
  ConfigureClinicalProfileValidationSchema,
} from '../../../utils/zod-schemas/configre-clinical-profile';

const saveConfigureClinicalProfile = isAuthenticated.input(ConfigureClinicalProfileValidationSchema).mutation(async ({
                                                                                                                       input,
                                                                                                                       ctx,
                                                                                                                     }) => {

  return prisma.configureClinicalProfile.upsert({
    where: {
      organization_id: ctx.user.organization_id,
    },
    create: {
      ...input,
      organization_id: ctx.user.organization_id,
    },
    update: input,
  });
});
export default saveConfigureClinicalProfile;
