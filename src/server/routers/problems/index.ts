import { t } from 'src/server/trpc';
import list from './list';

import deleteAllergy from './delete-problem';
import saveAllergy from './save-problem';
import getAllergy from './get-problem';
import search from './search-problem';
import getEctToken from './get-ect-token';

/**
 * Problems router
 */
const problemRouter = t.router({
  save: saveAllergy,
  delete: deleteAllergy,
  get: getAllergy,
  list,
  search,
  getEctToken,
});

export default problemRouter;
