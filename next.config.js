// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  env: {
    PLATFORM_VERSION: require('child_process').execSync('git rev-parse --short HEAD').toString().trim(),
  }
}

module.exports = nextConfig

module.exports = withSentryConfig(
  module.exports,
  { silent: true },
  { hideSourceMaps: true },
);
