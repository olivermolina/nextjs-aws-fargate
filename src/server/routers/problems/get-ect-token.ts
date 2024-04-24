import { getToken } from '../../../libs/icd-api';
import { isAuthenticated } from '../middleware/isAuthenticated';

const getEctToken = isAuthenticated.mutation(async ({ input }) => {
  return await getToken();
});

export default getEctToken;
