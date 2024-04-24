'use client';

import { useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SplashScreen } from 'src/components/splash-screen';
import { trpc } from 'src/app/_trpc/client';
import { paths } from '../../paths';

const Page = () => {
  const mutation = trpc.organization.stripeConnect.useMutation();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const router = useRouter();

  const onConnect = useCallback(async () => {
    if (code) {
      await mutation.mutateAsync({ code: code });
    }
    router.push(`${paths.dashboard.account}?tab=organization`);
  }, [code, router]);

  useEffect(() => {
    onConnect();
  }, [code, router]);

  if (error && errorDescription) {
    return (
      <>
        <h1>{error}</h1>
        <h2>{errorDescription}</h2>
      </>
    );
  }

  return (
    <>
      <SplashScreen />
    </>
  );
};

export default Page;
