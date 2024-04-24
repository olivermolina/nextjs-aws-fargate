import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { TemplateValidationSchema } from '../../../utils/zod-schemas/template';
import { ObjectId } from 'bson';

const saveTemplate = isAuthenticated
  .input(TemplateValidationSchema)
  .mutation(async ({ input, ctx }) => {
    const { id, ...restInputs } = input;

    return prisma.template.upsert({
      where: {
        id: id || new ObjectId().toString('hex'),
      },
      update: restInputs,
      create: {
        ...restInputs,
        organization_id: ctx.user.organization_id,
        created_by_id: ctx.user.id,
        shared: ['organization'],
      },
    });
  });

export default saveTemplate;
