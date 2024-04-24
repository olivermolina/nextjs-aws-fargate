import { t } from 'src/server/trpc';
import list from './list';

import deleteLocation from './delete-location';
import updateLocation from './update-location';
import createLocation from './create-location';
import getLocation from './get-location';
import getLocationByOrganizationId from './get-location-by-organization-id';

/**
 * Location router
 */
const locationRouter = t.router({
  create: createLocation,
  update: updateLocation,
  delete: deleteLocation,
  get: getLocation,
  getLocationByOrganizationId,
  list,
});

export default locationRouter;
