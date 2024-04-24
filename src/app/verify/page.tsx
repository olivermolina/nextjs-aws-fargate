'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { SplashScreen } from 'src/components/splash-screen';
import { trpc } from 'src/app/_trpc/client';
import { paths } from '../../paths';
import { useAuth } from '../../hooks/use-auth';
import { AuthContextType } from '../../contexts/auth/jwt';
import { useCallback, useEffect } from 'react';
import { AuthUser } from '../../contexts/auth/jwt/auth-context';

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { signUp } = useAuth<AuthContextType>();
  const { data, isLoading, error } = trpc.auth.verify.useQuery(
    {
      token: token || '',
    },
    {
      enabled: !!token,
    }
  );

  const callback = useCallback(async () => {
    if (!isLoading && data) {
      await signUp(data as AuthUser);
      router.push(paths.dashboard.index);
    }

    if (!isLoading || error) {
      router.push('/login');
    }
  }, [isLoading, error, data]);

  useEffect(() => {
    callback();
  }, [isLoading, error, data]);

  return (
    <>
      <SplashScreen />
    </>
  );
};

export default Page;
