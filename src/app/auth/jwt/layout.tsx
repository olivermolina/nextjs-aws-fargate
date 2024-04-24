'use client';

import type { ReactNode } from 'react';

import { GuestGuard } from 'src/guards/guest-guard';
import { IssuerGuard } from 'src/guards/issuer-guard';
import { Layout as AuthLayout } from 'src/layouts/auth/classic-layout';
import { Issuer } from 'src/utils/auth';

interface LayoutProps {
  children: ReactNode;
}

const Layout = (props: LayoutProps) => {
  const { children } = props;

  return (
    <IssuerGuard issuer={Issuer.JWT}>
      <GuestGuard>
        <AuthLayout>{children}</AuthLayout>
      </GuestGuard>
    </IssuerGuard>
  );
};

export default Layout;
