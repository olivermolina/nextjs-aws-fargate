import { isAuthenticated, UpdatedContext } from '../middleware/isAuthenticated';
import { createServiceSlug } from '../../../utils/create-service-slug';
import prisma from '../../../libs/prisma';
import { ServiceWithStaff } from '../../../types/service';
import { serviceSelect } from './index';
import { ServiceInput, ServicesValidationSchema } from '../../../utils/zod-schemas/service';
import { PrismaClient } from '@prisma/client';

const saveService = async (input: ServiceInput, trx: PrismaClient, ctx: UpdatedContext) => {
  const { id, staffIds, displayName, telemedicine, taxable, ...rest } = input;

  const slug = await createServiceSlug({
    name: input.name,
    organization_id: ctx.user.organization_id,
  });

  const data = {
    ...rest,
    ...(typeof telemedicine == 'boolean' && { telemedicine }),
    ...(typeof taxable == 'boolean' && { taxable }),
    ...(displayName && { display_name: displayName }),
    slug,
    duration: input.duration || 0,
    price: input.price || 0,
    organization_id: ctx.user.organization_id,
    created_by_id: ctx.user.id,
    type: 'standard',
  };

  if (input.id) {
    return (await trx.service.update({
      where: {
        id: id,
      },
      data,
      select: serviceSelect,
    })) as ServiceWithStaff;
  }

  return (await trx.service.create({
    data,
    select: serviceSelect,
  })) as ServiceWithStaff;
};

export const saveServices = isAuthenticated
  .input(ServicesValidationSchema)
  .mutation(async ({ input, ctx }) => {
    const { services } = input;

    return prisma.$transaction(
      async (trx) => {
        return await Promise.all(
          services.map((service) => saveService(service, trx as PrismaClient, ctx)),
        );
      },
      {
        maxWait: 10000, // default: 2000
        timeout: 10000, // default: 5000
      }
    );
  });
