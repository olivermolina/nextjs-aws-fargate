import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import { createServiceSlug } from '../../../utils/create-service-slug';
import prisma from '../../../libs/prisma';
import { ServiceWithStaff } from '../../../types/service';
import { serviceSelect } from './index';

export const updateService = isAuthenticated
  .input(
    z.object({
      id: z.string(),
      name: z.string(),
      staffIds: z.array(z.string()).optional().nullable(),
      duration: z.coerce.number().optional().nullable(),
      price: z.coerce.number().optional().nullable(),
      description: z.string().optional().nullable(),
      display_name: z.string().optional().nullable(),
      telemedicine: z.boolean().optional().nullable(),
      taxable: z.boolean().optional().nullable(),
      service_color: z.string().optional().nullable(),
      code: z.string().optional().nullable(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const { id, staffIds, telemedicine, taxable, ...rest } = input;

    const slug = await createServiceSlug({
      name: input.name,
      organization_id: ctx.user.organization_id,
    });

    return (await prisma.service.update({
      where: {
        id: id,
      },
      data: {
        ...rest,
        slug,
        duration: input.duration || 0,
        price: input.price || 0,
        organization_id: ctx.user.organization_id,
        created_by_id: ctx.user.id,
        ...(typeof telemedicine == 'boolean' && { telemedicine }),
        ...(typeof taxable == 'boolean' && { taxable }),
        ...(staffIds
          ? {
            staffs: {
              deleteMany: {
                staff_id: {
                  notIn: staffIds,
                },
              },
              connectOrCreate: staffIds.map((staffId) => ({
                where: {
                  service_id_staff_id: {
                    service_id: id,
                    staff_id: staffId,
                  },
                },
                create: {
                  staff_id: staffId,
                },
              })),
            },
          }
          : {
            staffs: {
              deleteMany: {
                service_id: id,
              },
            },
          }),
      },
      select: serviceSelect,
    })) as ServiceWithStaff;
  });
