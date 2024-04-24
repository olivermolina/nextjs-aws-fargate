import { t } from 'src/server/trpc';
import list from './list';

import deleteAllergy from './delete-allergy';
import saveAllergy from './save-allergy';
import getAllergy from './get-allergy';
import listOptions from './list-options';

/**
 * Allergy router
 */
const allergyRouter = t.router({
  save: saveAllergy,
  delete: deleteAllergy,
  get: getAllergy,
  list,
  listOptions,
});

export default allergyRouter;
