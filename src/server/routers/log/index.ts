import { t } from 'src/server/trpc';
import list from './list';

import createLog from './create-log';

/**
 * Log router
 */
const logRouter = t.router({
  create: createLog,
  list,
});

export default logRouter;
