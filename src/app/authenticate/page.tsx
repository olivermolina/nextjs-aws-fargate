'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStytchB2BClient, useStytchMember } from '@stytch/nextjs/b2b';
import { SplashScreen } from 'src/components/splash-screen';
import { trpc } from 'src/app/_trpc/client';
import { RoleName, Status, UserType } from '@prisma/client';
import { paths } from 'src/paths';
import { useTimezone } from '../../hooks/use-timezone';
import { useGettingStarted } from '../../hooks/use-getting-started';

const OAUTH_TOKEN = 'discovery_oauth';
const MAGIC_LINKS_TOKEN = 'multi_tenant_magic_links';

/**
 * During both the Magic link and OAuth flow, Stytch will redirect the user back to your application to a specified redirect URL (see Login.js).
 * Stytch will append query parameters to the redirect URL which are then used to complete the authentication flow.
 * A redirect URL for this example app will look something like: http://localhost:3000/authenticate?stytch_token_type=magic_links&token=abc123
 *
 * The AuthenticatePage will detect the presence of a token in the query parameters, and attempt to authenticate it.
 * On successful authentication, a session will be created and the user will be redirect to /profile
 */

const Page = () => {
  const { member, isInitialized } = useStytchMember();
  const timezone = useTimezone();

  const mutation = trpc.auth.signup.useMutation();
  const activateMutation = trpc.auth.activateUser.useMutation();
  const { data } = trpc.auth.getMember.useQuery(
    {
      memberId: member?.member_id || '',
    },
    {
      enabled: !!member,
      refetchOnWindowFocus: false,
    }
  );

  const { isGettingStartedCompleted } = useGettingStarted();

  const searchParams = useSearchParams();
  const nextRoute = searchParams.get('next_route');

  const stytch = useStytchB2BClient();
  const router = useRouter();

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
            if (resp.discovered_organizations.length === 0) {
              const result = await stytch.discovery.organizations.create({
                email_allowed_domains: [],
                organization_name: '',
                session_duration_minutes: 60 * 24 * 7, // 7 days
              });
              const name = result.member.name.split(' ');
              await mutation.mutateAsync({
                email: result.member.email_address,
                stytch_member_id: result.member.member_id,
                stytch_organization_id: result.organization.organization_id,
                first_name: name?.[0] || '',
                last_name: name?.[1] || '',
                timezone: timezone.value,
                organization_name: result.organization.organization_name,
                category: '',
                size: '',
              });
            } else {
              // If the user is part of an organization, create a new session
              stytch.discovery.intermediateSessions.exchange({
                organization_id:
                  resp.discovered_organizations[0].membership.member?.organization_id!,
                session_duration_minutes: 60 * 24 * 7, // 7 days
              });
            }
          })
          .catch((err) => {
            console.log(err);
            router.push(paths.login);
          });
      } else if (token && stytch_token_type === MAGIC_LINKS_TOKEN) {
        // automatically authenticate the magic link token
        stytch.magicLinks
          .authenticate({
            magic_links_token: token,
            session_duration_minutes: 60 * 24 * 7, // 7 days
          })
          .then(async (resp) => {
            const user = await activateMutation.mutateAsync({
              memberId: resp.member_id,
            });

            if (user?.type === UserType.PATIENT && data?.active) {
              router.replace(nextRoute || paths.patient.account);
              return;
            }

            if (
              user?.type === UserType.STAFF &&
              user?.active &&
              user?.organization.status === Status.COMPLETED
            ) {
              const defaultRoute = isGettingStartedCompleted
                ? nextRoute || paths.dashboard.index
                : paths.dashboard.gettingStarted;
              router.replace(defaultRoute);
              return;
            }
          })
          .catch((err) => {
            console.log(err);
            router.push(paths.login);
          });
      }
    }
  }, [isInitialized, router, searchParams, stytch, member, timezone, isGettingStartedCompleted]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (member && data?.type === UserType.PATIENT && !data?.active) {
      router.replace(paths.onboard);
      return;
    }

    if (member && data?.type === UserType.PATIENT && data?.active) {
      router.replace(nextRoute || paths.patient.account);
      return;
    }

    if (
      member &&
      data?.type === UserType.STAFF &&
      data?.active &&
      data?.organization.status === Status.COMPLETED
    ) {
      const defaultRoute = isGettingStartedCompleted
        ? nextRoute || paths.dashboard.index
        : paths.dashboard.gettingStarted;

      router.replace(defaultRoute);
      return;
    }

    if (
      member &&
      data?.role?.name === RoleName.ADMIN &&
      data?.organization.status === Status.PENDING
    ) {
      router.replace(nextRoute || paths.checkout);
      return;
    }
  }, [router, member, isInitialized, data, nextRoute, isGettingStartedCompleted]);

  return (
    <>
      <SplashScreen />
    </>
  );
};

export default Page;
