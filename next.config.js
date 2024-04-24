// @ts-check
/* eslint-disable @typescript-eslint/no-var-requires */
const { env } = require('./src/server/env');

/** @type {import('next').NextConfig} */
const config = {
  publicRuntimeConfig: {
    NODE_ENV: env.NODE_ENV,
    NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN: env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID: env.NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID,
    NEXT_PUBLIC_PUSHER_APP_CLUSTER: env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
    NEXT_PUBLIC_PUSHER_APP_KEY: env.NEXT_PUBLIC_PUSHER_APP_KEY,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  },
  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true, // Change this to `false` if this is a temporary redirect
      },
      {
        source: '/auth-demo/login/modern',
        destination: '/login',
        permanent: true, // Change this to `false` if this is a temporary redirect
      },
      // Add more redirects here if needed
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    config.resolve.fallback = {
      // if you miss it, all the other options in fallback, specified
      // by next.js will be dropped.
      ...config.resolve.fallback,
      fs: false, // the solution
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lunahealthapp.s3.ca-central-1.amazonaws.com',
        pathname: '**',
      },
    ],
  }
};

module.exports = config;
