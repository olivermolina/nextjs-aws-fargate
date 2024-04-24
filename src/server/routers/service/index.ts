import { t } from 'src/server/trpc';
import { Prisma } from '@prisma/client';
import { list } from './list';
import { listByOrganization } from './list-by-organization';
import { getService } from './get-service';
import { createService } from './create-service';
import { updateService } from './update-service';
import { deleteService } from './delete-service';
import { saveServices } from './save-services';

export const serviceSelect = Prisma.validator<Prisma.ServiceSelect>()({
  id: true,
  name: true,
  organization_id: true,
  duration: true,
  price: true,
  created_by_id: true,
  created_at: true,
  updated_at: true,
  service_color: true,
  display_name: true,
  description: true,
  telemedicine: true,
  taxable: true,
  slug: true,
  code: true,
  staffs: {
    select: {
      Staff: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
          organization_id: true,
          created_at: true,
          updated_at: true,
        },
      },
    },
  },
});

const serviceRouter = t.router({
  list: list,
  listByOrganizationId: listByOrganization,
  get: getService,
  create: createService,
  update: updateService,
  delete: deleteService,
  saveServices: saveServices,
});

export default serviceRouter;
