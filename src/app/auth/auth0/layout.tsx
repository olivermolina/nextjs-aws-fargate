'use client';

import { ReactNode } from 'react';

import { IssuerGuard } from 'src/guards/issuer-guard';
import { GuestGuard } from 'src/guards/guest-guard';
import { Issuer } from 'src/utils/auth';

interface LayoutProps {
  children: ReactNode;
}

const Layout = (props: LayoutProps) => {
  const { children } = props;

  return (
    <IssuerGuard issuer={Issuer.Auth0}>
      <GuestGuard>{children}</GuestGuard>
    </IssuerGuard>
  );
};

export default Layout;
