import { t } from 'src/server/trpc';
import saveTemplate from './save-template';
import list from './list';
import deleteTemplate from './delete-template';
import listTags from './list-tags';
import deleteTags from './delete-tags';
import saveTag from './save-tag';
import listByOrganizationId from './list-by-organization-id';
import getTemplate from './get-template';
import shareTemplate from './share-template';

/**
 * User router containing all the user api endpoints
 */
const templateRouter = t.router({
  save: saveTemplate,
  list,
  listByOrganizationId,
  delete: deleteTemplate,
  listTags,
  deleteTags,
  saveTag,
  get: getTemplate,
  share: shareTemplate,
});

export default templateRouter;
