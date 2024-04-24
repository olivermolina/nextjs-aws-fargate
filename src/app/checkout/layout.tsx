'use client';

import type { ReactNode } from 'react';
import PropTypes from 'prop-types';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface LayoutProps {
  children?: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return <Elements stripe={stripePromise}>{children}</Elements>;
}

Layout.propTypes = {
  children: PropTypes.node,
};
