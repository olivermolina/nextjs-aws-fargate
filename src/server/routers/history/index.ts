import { t } from 'src/server/trpc';
import list from './list';
import deleteHistory from './delete-history';
import saveHistory from './save-history';
import getHistory from './get-history';
import listOptions from './list-options';

/**
 * History router
 */
const historyRouter = t.router({
  save: saveHistory,
  delete: deleteHistory,
  get: getHistory,
  list,
  listOptions,
});

export default historyRouter;
