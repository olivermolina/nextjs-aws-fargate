'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStytchB2BClient, useStytchMember } from '@stytch/nextjs/b2b';
import { SplashScreen } from 'src/components/splash-screen';
import { trpc } from 'src/app/_trpc/client';
import { paths } from 'src/paths';
import { useDispatch, useSelector } from 'src/store';
import { slice } from 'src/slices/schedule';
import { UserType } from '@prisma/client';
import toast from 'react-hot-toast';
import { useAuth } from 'src/hooks/use-auth';
import { AuthContextType } from 'src/contexts/auth/jwt';
import { AuthUser } from 'src/contexts/auth/jwt/auth-context';

const OAUTH_TOKEN = 'discovery_oauth';

const Page = () => {
  const { member, isInitialized } = useStytchMember();
  const { selectedStaffId, authenticateRedirectPath } = useSelector((state) => state.schedule);

  const dispatch = useDispatch();

  const { setAuthUser } = useAuth<AuthContextType>();

  const mutation = trpc.user.createScheduleUser.useMutation();
  const mutationUpdate = trpc.user.update.useMutation();
  const { data } = trpc.auth.getMember.useQuery(
    {
      memberId: member?.member_id || '',
    },
    {
      refetchOnWindowFocus: false,
      enabled: !!member,
      keepPreviousData: true,
    }
  );

  const stytch = useStytchB2BClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (stytch && !member && isInitialized) {
      const token = searchParams.get('token');
      const stytch_token_type = searchParams.get('stytch_token_type');

      // If the user is not logged in, and there is a token in the query params, attempt to authenticate it
      if (token && stytch_token_type === OAUTH_TOKEN) {
        stytch.oauth.discovery
          .authenticate({
            discovery_oauth_token: token,
          })
          .then(async (resp) => {
            // If the user is not part of an organization, create a new organization and session

            if (resp.discovered_organizations.length === 0 && selectedStaffId) {
              const result = await mutation.mutateAsync({
                email: resp.email_address,
                staffId: selectedStaffId,
              });
              if (result) {
                const exchangeResult = await stytch.discovery.intermediateSessions.exchange({
                  organization_id: result.organization.stytch_id,
                  session_duration_minutes: 60 * 24 * 7, // 7 days
                });

                const [first_name, last_name] = exchangeResult.member.name.split(' ');
                const updatedUser = await mutationUpdate.mutateAsync({
                  id: result.id,
                  first_name: first_name || '',
                  last_name: last_name || '',
                });
                setAuthUser(updatedUser as unknown as AuthUser);
                dispatch(slice.actions.setUser(updatedUser));
              }
            } else {
              // If the user is part of an organization, create a new session
              await stytch.discovery.intermediateSessions.exchange({
                organization_id:
                  resp.discovered_organizations[0].membership.member?.organization_id!,
                session_duration_minutes: 60 * 24 * 7, // 7 days
              });
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  }, [isInitialized, router, searchParams, stytch, member, selectedStaffId]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (data && member && data.type === UserType.STAFF) {
      try {
        toast.error('Login as patient to continue booking an appointment.');
        stytch.session.revoke().then(() => {
          dispatch(slice.actions.setScheduleActiveStep(2));
          router.push(paths.schedule.index.replace(':slug', data.organization.slug));
        });
      } catch (e) {}
      return;
    }

    if (data && member && data.type === UserType.PATIENT) {
      setAuthUser(data as unknown as AuthUser);
      dispatch(slice.actions.setUser(data as unknown as AuthUser));
      dispatch(slice.actions.setScheduleActiveStep(2));

      const redirectPath =
        authenticateRedirectPath || paths.schedule.index.replace(':slug', data.organization.slug);

      router.replace(redirectPath);

      return;
    }
  }, [router, member, isInitialized, data, dispatch, authenticateRedirectPath]);

  return (
    <>
      <SplashScreen />
    </>
  );
};

export default Page;
