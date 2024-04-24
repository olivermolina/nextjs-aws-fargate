import { t } from 'src/server/trpc';
import list from './list';

import deleteVital from './delete-vital';
import saveVital from './save-vital';
import getVital from './get-vital';
import currentVital from './current-vital';
import getVitalHistory from './get-vital-history';

/**
 * Vitals router
 */
const vitalsRouter = t.router({
  save: saveVital,
  delete: deleteVital,
  get: getVital,
  list,
  current: currentVital,
  getVitalHistory,
});

export default vitalsRouter;
