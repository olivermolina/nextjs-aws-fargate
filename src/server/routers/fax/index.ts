import { t } from 'src/server/trpc';
import sentList from './sentList';

import deleteFax from './delete-fax';
import createFax from './createFax';
import getFax from './get-fax';
import receivedList from './receivedList';
import retrieveFaxPdf from './retrieve-fax-pdf';

/**
 * Fax router
 */
const faxRouter = t.router({
  create: createFax,
  delete: deleteFax,
  get: getFax,
  sentList,
  receivedList,
  retrieveFaxPdf,
});

export default faxRouter;
