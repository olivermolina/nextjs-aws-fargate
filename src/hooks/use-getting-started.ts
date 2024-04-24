import { trpc } from '../app/_trpc/client';
import { useMemo } from 'react';
import { useAuth } from './use-auth';
import { AuthContextType } from '../contexts/auth/jwt';
import { UserType } from '@prisma/client';

export const useGettingStarted = () => {
  const { user } = useAuth<AuthContextType>();
  const { data: gettingStarted, isLoading } = trpc.organization.gettingStarted.useQuery(undefined, {
    refetchOnWindowFocus: true,
    enabled: user !== null,
  });
  const isGettingStartedCompleted = useMemo(
    () => {

      if (user?.type === UserType.PATIENT) {
        return true;
      }

      return gettingStarted?.hasPatients &&
        gettingStarted?.hasServices &&
        gettingStarted?.hasGoogleCalendar &&
        gettingStarted?.hasStripe;
    },
    [gettingStarted, user],
  );


  return {
    gettingStarted,
    isGettingStartedCompleted,
    isLoading: user === null ? false : isLoading,
  };
};
