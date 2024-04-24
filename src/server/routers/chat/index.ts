import { t } from 'src/server/trpc';
import createMessage from './create-message';
import getMessage from './get-message';
import signIn from './sign-in';
import threads from './threads';
import getThread from './get-thread';
import markThreadAsSeen from './mark-thread-as-seen';
import getContacts from './get-contacts';
import attachFiles from './attach-files';
import getMessageHistory from './get-message-history';

/**
 * User router containing all the user api endpoints
 */
const chatRouter = t.router({
  createMessage,
  getMessage,
  signIn,
  threads,
  getThread,
  markThreadAsSeen,
  getContacts,
  attachFiles,
  getMessageHistory,
});

export default chatRouter;
