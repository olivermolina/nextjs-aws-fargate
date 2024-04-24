import prisma from '../libs/prisma';

/**
 * Create a unique service slug
 *
 * @param input - The service input
 * @returns The unique service slug
 */

export const createServiceSlug = async (input: { name: string; organization_id: string }) => {
  const serviceSlug = input.name.replace(/\s+/g, '-').replace(/['"]/g, '');

  const service = await prisma.service.findFirst({
    where: {
      slug: serviceSlug,
      organization_id: input.organization_id,
    },
  });

  if (!service) {
    return serviceSlug;
  }

  return `${serviceSlug}-${Date.now()}`;
};
