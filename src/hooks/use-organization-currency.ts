import { useAuth } from './use-auth';

export const useOrganizationCurrency = () => {
  const { user } = useAuth();
  const currency = user?.organization?.currency || 'USD';
  const symbol = user?.organization?.currency_symbol || '$';

  return {
    currency,
    symbol,
  };
};
