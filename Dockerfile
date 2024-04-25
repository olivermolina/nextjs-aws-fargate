# Use a specific version of the official Node.js image
FROM node:20.12.0-alpine3.19 AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

# Install Chromium
RUN apk add --no-cache chromium

WORKDIR /app

# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Specify the variable you need
ARG NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN
ENV NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN=${NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN}
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
ARG STYTCH_PROJECT_ENV
ENV STYTCH_PROJECT_ENV=${STYTCH_PROJECT_ENV}
ARG STYTCH_PROJECT_ID
ENV STYTCH_PROJECT_ID=${STYTCH_PROJECT_ID}
ARG STYTCH_SECRET
ENV STYTCH_SECRET=${STYTCH_SECRET}
ARG CUSTOMER_IO_API_KEY
ENV CUSTOMER_IO_API_KEY=${CUSTOMER_IO_API_KEY}
ARG JWT_SECRET_KEY
ENV JWT_SECRET_KEY=${JWT_SECRET_KEY}
ARG SENDGRID_API_KEY
ENV SENDGRID_API_KEY=${SENDGRID_API_KEY}
ARG AWS_ACCESS_KEY_ID
ENV AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
ARG AWS_SECRET_ACCESS_KEY
ENV AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
ARG AWS_S3_REGION
ENV AWS_S3_REGION=${AWS_S3_REGION}
ARG AWS_S3_BUCKET_NAME
ENV AWS_S3_BUCKET_NAME=${AWS_S3_BUCKET_NAME}
ARG QSTASH_CURRENT_SIGNING_KEY
ENV QSTASH_CURRENT_SIGNING_KEY=${QSTASH_CURRENT_SIGNING_KEY}
ARG QSTASH_NEXT_SIGNING_KEY
ENV QSTASH_NEXT_SIGNING_KEY=${QSTASH_NEXT_SIGNING_KEY}
ARG QSTASH_URL
ENV QSTASH_URL=${QSTASH_URL}
ARG QSTASH_TOKEN
ENV QSTASH_TOKEN=${QSTASH_TOKEN}
ARG MESSAGEBIRD_API_KEY
ENV MESSAGEBIRD_API_KEY=${MESSAGEBIRD_API_KEY}
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
ARG STRIPE_SECRET_KEY
ENV STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
ARG STRIPE_WEBHOOK_SECRET
ENV STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
ARG NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID
ENV NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID=${NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID}
ARG PUSHER_APP_ID
ENV PUSHER_APP_ID=${PUSHER_APP_ID}
ARG PUSHER_APP_SECRET
ENV PUSHER_APP_SECRET=${PUSHER_APP_SECRET}
ARG NEXT_PUBLIC_PUSHER_APP_KEY
ENV NEXT_PUBLIC_PUSHER_APP_KEY=${NEXT_PUBLIC_PUSHER_APP_KEY}
ARG NEXT_PUBLIC_PUSHER_APP_CLUSTER
ENV NEXT_PUBLIC_PUSHER_APP_CLUSTER=${NEXT_PUBLIC_PUSHER_APP_CLUSTER}
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID}
ARG GOOGLE_CLIENT_SECRET
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
ARG WHO_ICD_API_CLIENT_ID
ENV WHO_ICD_API_CLIENT_ID=${WHO_ICD_API_CLIENT_ID}
ARG WHO_ICD_API_CLIENT_SECRET
ENV WHO_ICD_API_CLIENT_SECRET=${WHO_ICD_API_CLIENT_SECRET}
ARG DAILY_API_KEY
ENV DAILY_API_KEY=${DAILY_API_KEY}
ARG DAILY_REST_DOMAIN
ENV DAILY_REST_DOMAIN=${DAILY_REST_DOMAIN}

ENV NEXT_TELEMETRY_DISABLED 1
ENV GENERATE_SOURCEMAP=false
ENV PORT 80
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV production

RUN yarn build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 80

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD HOSTNAME="0.0.0.0" node server.js
