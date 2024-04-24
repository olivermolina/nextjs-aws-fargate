import React, { FC, ReactNode, useEffect } from 'react';
import PropTypes from 'prop-types';

import { withAuthGuard } from 'src/hocs/with-auth-guard';
import { useSettings } from 'src/hooks/use-settings';

import { useSections } from './config';
import { HorizontalLayout } from './horizontal-layout';
import { VerticalLayout } from './vertical-layout';
import { AppAccess, RoleName, UserType } from '@prisma/client';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import { useAuth } from 'src/hooks/use-auth';
import { useSelector } from 'src/store';
import { useOrganizationStore } from 'src/hooks/use-organization';
import { trpc } from '../../app/_trpc/client';
import toast from 'react-hot-toast';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { SplashScreen } from '../../components/splash-screen';

interface LayoutProps {
  children?: ReactNode;
}

export const VerifyAlert: FC = () => {
  const { user } = useAuth();
  const mutation = trpc.auth.resendConfirmation.useMutation();
  const resendConfirmationEmail = async () => {
    try {
      await mutation.mutateAsync();
      toast.success('Confirmation email sent.');
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (user?.role?.name === RoleName.ADMIN && !user?.organization.isVerified) {
    return (
      <Alert
        severity={'success'}
        variant={'filled'}
        sx={{
          borderRadius: 0,
          backgroundColor: (theme) => theme.palette.success.light,
          pl: 4,
        }}
        icon={false}
      >
        <Stack
          spacing={1}
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          alignItems={{
            xs: 'flex-start',
            sm: 'center',
          }}
        >
          <Typography variant={'body2'}>
            Please confirm your email address and verify your account.
          </Typography>
          <Link
            sx={{ width: 220, textAlign: 'left' }}
            component={'button'}
            variant={'body2'}
            onClick={resendConfirmationEmail}
            disabled={mutation.isLoading}
          >
            <Typography variant={'body2'}>
              Resend confirmation email
              {mutation.isLoading && (
                <CircularProgress
                  sx={{ ml: 1 }}
                  size={15}
                />
              )}
            </Typography>
          </Link>
        </Stack>
      </Alert>
    );
  }

  return null;
};

export const LimitedAppAccessAlert: FC = () => {
  const { user } = useAuth();
  const { data: organization, refetch } = useOrganizationStore();

  const isRefetch = useSelector((state) => state.app.refetch);

  useEffect(() => {
    if (isRefetch) {
      refetch();
    }
  }, [isRefetch]);

  if (user?.type === UserType.STAFF && organization?.access === AppAccess.Block) {
    return (
      <Alert
        severity={'error'}
        variant={'filled'}
        sx={{
          borderRadius: 0,
          backgroundColor: (theme) => theme.palette.error.main,
          pl: 4,
        }}
        icon={false}
      >
        {'Access to the app is limited. Please pay your bill to continue using the app.'}
      </Alert>
    );
  }

  return null;
};

export const Layout: FC<LayoutProps> = withAuthGuard((props) => {
  const { user } = useAuth();
  const settings = useSettings();
  const sections = useSections();
  const navColor = user?.type === UserType.PATIENT ? 'discrete' : 'evident';
  const contrast = user?.type === UserType.PATIENT ? 'normal' : 'high';
  const appPermissions = useSelector((state) => state.app.permissions);

  const logOutLoading = useSelector((state) => state.app.logOutLoading);

  if (
    ((!appPermissions || appPermissions.length === 0) && user?.type === UserType.STAFF) ||
    logOutLoading
  ) {
    return (
      <>
        <SplashScreen />
      </>
    );
  }

  if (settings.layout === 'horizontal') {
    return (
      <HorizontalLayout
        sections={sections}
        navColor={navColor}
        {...props}
      />
    );
  }

  return (
    <VerticalLayout
      sections={sections}
      navColor={navColor}
      {...props}
    />
  );
});

Layout.propTypes = {
  children: PropTypes.node,
};
