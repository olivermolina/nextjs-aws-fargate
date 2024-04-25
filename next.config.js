// @ts-check
/* eslint-disable @typescript-eslint/no-var-requires */
const { env } = require('./src/server/env');

/** @type {import('next').NextConfig} */
const config = {
  output: 'standalone',
  serverRuntimeConfig: {
    DATABASE_URL: env.DATABASE_URL,
    STYTCH_PROJECT_ENV: env.STYTCH_PROJECT_ENV,
    STYTCH_PROJECT_ID: env.STYTCH_PROJECT_ID,
    STYTCH_SECRET: env.STYTCH_SECRET,
    CUSTOMER_IO_API_KEY: env.CUSTOMER_IO_API_KEY,
    JWT_SECRET_KEY: env.JWT_SECRET_KEY,
    SENDGRID_API_KEY: env.SENDGRID_API_KEY,
    AWS_ACCESS_KEY_ID: env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: env.AWS_SECRET_ACCESS_KEY,
    AWS_S3_REGION: env.AWS_S3_REGION,
    AWS_S3_BUCKET_NAME: env.AWS_S3_BUCKET_NAME,
    QSTASH_URL: env.QSTASH_URL,
    QSTASH_TOKEN: env.QSTASH_TOKEN,
    QSTASH_CURRENT_SIGNING_KEY: env.QSTASH_CURRENT_SIGNING_KEY,
    QSTASH_NEXT_SIGNING_KEY: env.QSTASH_NEXT_SIGNING_KEY,
    MESSAGEBIRD_API_KEY: env.MESSAGEBIRD_API_KEY,
    STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: env.STRIPE_WEBHOOK_SECRET,
    PUSHER_APP_ID: env.PUSHER_APP_ID,
    PUSHER_APP_SECRET: env.PUSHER_APP_SECRET,
    GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
    WHO_ICD_API_CLIENT_ID: env.WHO_ICD_API_CLIENT_ID,
    WHO_ICD_API_CLIENT_SECRET: env.WHO_ICD_API_CLIENT_SECRET,
    DAILY_API_KEY: env.DAILY_API_KEY,
    DAILY_REST_DOMAIN: env.DAILY_REST_DOMAIN,
  },
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
