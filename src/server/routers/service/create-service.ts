import { isAuthenticated } from '../middleware/isAuthenticated';
import { createServiceSlug } from '../../../utils/create-service-slug';
import prisma from '../../../libs/prisma';
import { ServiceWithStaff } from '../../../types/service';
import { serviceSelect } from './index';
import { ServiceValidationSchema } from '../../../utils/zod-schemas/service';

export const createService = isAuthenticated
  .input(ServiceValidationSchema)
  .mutation(async ({ input, ctx }) => {
    const { staffIds, telemedicine, displayName, taxable, ...rest } = input;

    const slug = await createServiceSlug({
      name: input.name,
      organization_id: ctx.user.organization_id,
    });
    return (await prisma.service.create({
      data: {
        ...rest,
        duration: input.duration || 0,
        price: input.price || 0,
        organization_id: ctx.user.organization_id,
        display_name: input.displayName || '',
        created_by_id: ctx.user.id,
        type: 'standard',
        ...(typeof telemedicine == 'boolean' && { telemedicine }),
        ...(typeof taxable == 'boolean' && { taxable }),
        slug,
        ...(staffIds &&
          staffIds.length > 0 && {
            staffs: {
              createMany: {
                data: staffIds.map((id) => ({
                  staff_id: id,
                })),
              },
            },
          }),
      },
      select: serviceSelect,
    })) as ServiceWithStaff;
  });
