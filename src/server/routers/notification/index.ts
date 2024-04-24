import { t } from 'src/server/trpc';
import list from './list';
import markAllRead from './mark-all-read';
import markRead from './mark-read';
import deleteNotification from './delete-notification';

/**
 * Notification router
 */
const notificationRouter = t.router({
  markRead,
  markAllRead,
  delete: deleteNotification,
  list,
});

export default notificationRouter;
