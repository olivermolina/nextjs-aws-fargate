import React, { FC, ReactNode, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { useAuth } from 'src/hooks/use-auth';
import { useRouter } from 'src/hooks/use-router';
import { paths } from 'src/paths';
import { RoleName, Status, UserType } from '@prisma/client';
import { usePathname } from 'src/hooks/use-pathname';
import { useSearchParams } from 'src/hooks/use-search-params';
import { useDispatch } from '../store';
import { searchParamsToUrlQueryString } from '../utils/search-params-to-query-string';
import { useRolePermission } from '../hooks/use-role-permissions';
import { slice } from '../slices/app';
import { useGettingStarted } from '../hooks/use-getting-started';
import { SplashScreen } from '../components/splash-screen';

interface AuthGuardProps {
  children: ReactNode;
}

const PublicPathNames = [
  paths.login,
  paths.register.index,
  paths.forgotPassword,
  paths.resetPassword,
  paths.onboard,
];

export const AuthGuard: FC<AuthGuardProps> = (props) => {
  const { children } = props;
  const router = useRouter();
  const { isAuthenticated, issuer, user } = useAuth();
  const [checked, setChecked] = useState<boolean>(false);

  const dispatch = useDispatch();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const { isGettingStartedCompleted, isLoading } = useGettingStarted();
  const check = useCallback(() => {
    if (returnTo?.includes('/schedule') && isAuthenticated) {
      router.replace(returnTo);
    }
    // If the user is not authenticated and the path is not public, redirect to login
    else if (!isAuthenticated && !PublicPathNames.includes(pathname)) {
      const newSearchParams = new URLSearchParams({
        returnTo: pathname + `?${searchParamsToUrlQueryString(searchParams)}`,
      }).toString();
      const href = pathname === paths.login ? paths.login : paths.login + `?${newSearchParams}`;
      router.replace(href);
    }
    // Redirect patient to onboard page if not active
    else if (isAuthenticated && user?.type === UserType.PATIENT && !user?.active) {
      router.replace(paths.onboard);
    }
      // If the user is authenticated and the path is not public, redirect to organization registration
    // page when the organization is not completed
    else if (
      isAuthenticated &&
      user?.organization.status !== Status.COMPLETED &&
      pathname !== paths.checkout &&
      user?.role?.name === RoleName.ADMIN
    ) {
      router.replace(paths.checkout);
    }
    // If the user is authenticated and the path is public, redirect to dashboard
    else if (
      isAuthenticated &&
      user?.organization.status === Status.COMPLETED &&
      PublicPathNames.includes(pathname)
    ) {
      router.replace(
        isGettingStartedCompleted ? paths.dashboard.index : paths.dashboard.gettingStarted,
      );
    } else {
      setChecked(true);
    }
  }, [isAuthenticated, issuer, router, returnTo, dispatch, isGettingStartedCompleted]);

  const { permissions } = useRolePermission(user?.id!);

  useEffect(() => {
    if (permissions) {
      dispatch(slice.actions.setPermissions(permissions));
    }
  }, [permissions]);

  // Only check on mount, this allows us to redirect the user manually when auth state changes
  useEffect(
    () => {
      if (!isLoading) {
        check();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoading],
  );

  if (isLoading || !checked) {
    return <SplashScreen />;
  }

  // If got here, it means that the redirect did not occur, and that tells us that the user is
  // authenticated / authorized.

  return <>{children}</>;
};

AuthGuard.propTypes = {
  children: PropTypes.node,
};
