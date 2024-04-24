// @ts-check
/**
 * This file is included in `/next.config.js` which ensures the app isn't built with invalid env vars.
 * It has to be a `.js`-file to be imported there.
 */
const yup = require('yup');

/*eslint sort-keys: "error"*/
const envSchema = yup.object().shape({
  AWS_ACCESS_KEY_ID: yup.string().required(),
  AWS_S3_BUCKET_NAME: yup.string().required(),
  AWS_S3_REGION: yup.string().required(),
  AWS_SECRET_ACCESS_KEY: yup.string().required(),
  CUSTOMER_IO_API_KEY: yup.string().required(),
  DAILY_API_KEY: yup.string().required(),
  DAILY_REST_DOMAIN: yup.string().required(),
  DATABASE_URL: yup.string().required(),
  GOOGLE_CLIENT_SECRET: yup.string().required(),
  JWT_SECRET_KEY: yup.string().required(),
  MESSAGEBIRD_API_KEY: yup.string().required(),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: yup.string().required(),
  NEXT_PUBLIC_PUSHER_APP_CLUSTER: yup.string().required(),
  NEXT_PUBLIC_PUSHER_APP_KEY: yup.string().required(),
  NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID: yup.string().required(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: yup.string().required(),
  NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN: yup.string().required(),
  NODE_ENV: yup.string().oneOf(['development', 'preview', 'production']).required(),
  PORT: yup.number().default(3000),
  PUSHER_APP_ID: yup.string().required(),
  PUSHER_APP_SECRET: yup.string().required(),
  QSTASH_CURRENT_SIGNING_KEY: yup.string().required(),
  QSTASH_NEXT_SIGNING_KEY: yup.string().required(),
  QSTASH_TOKEN: yup.string().required(),
  QSTASH_URL: yup.string().required(),
  SENDGRID_API_KEY: yup.string().required(),
  STRIPE_SECRET_KEY: yup.string().required(),
  STRIPE_WEBHOOK_SECRET: yup.string().required(),
  STYTCH_PROJECT_ENV: yup.string().required(),
  STYTCH_PROJECT_ID: yup.string().required(),
  WHO_ICD_API_CLIENT_ID: yup.string().required(),
  WHO_ICD_API_CLIENT_SECRET: yup.string().required(),
});

try {
  const env = envSchema.validateSync(process.env);
  module.exports.env = env;
} catch (error) {
  /** @type {yup.ValidationError} */
  // @ts-expect-error necessary typing
  const typedError = error;
  console.error('❌ Invalid environment variables:', JSON.stringify(typedError.errors, null, 4));
  process.exit(1);
}
