 
/* eslint-disable @typescript-eslint/no-require-imports */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  staticPageGenerationTimeout: 300,
  env: {
    PLATFORM_VERSION: require('child_process')
      .execSync('git rev-parse --short HEAD')
      .toString()
      .trim(),
    BUILD_TIMESTAMP: Date.now().toString(),
  },
  // Workaround for MUI-NextJS issues https://github.com/mui/material-ui/issues/46181#issuecomment-2894160823 
  transpilePackages: ["@mui/material-nextjs"], 
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'code.org',
        port: '',
        pathname: '/api/hour/**',
      },
    ],
  },
  outputFileTracingIncludes: {
    '**': ['./**/*.wasm'],
  },
  async redirects() {
    return [
      {
        source: '/summeracademy',
        destination: '/academy',
        permanent: true,
      },
      {
        source: '/summeracademy/2023',
        destination: '/academy/sa2023',
        permanent: true,
      },
      {
        source: '/summeracademy/2024',
        destination: '/academy/sa2024',
        permanent: true,
      },
    ];
  },
  // Cross-origin isolation is a required security policy to enable SharedArrayBuffer.
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer
  // Important!
  // Since Next.js 16.2, web workers are boostrapped from a separate chunk, which requires COEP.
  // Until https://github.com/vercel/next.js/issues/92676 is resolved, the source regex below
  // needs to be broad enough to cover also assets under /_next/static/.
  // Another subtlety: we must not add `i18n` to this config,
  // because it messes with the source regex to account for locale prefixes.
  async headers() {
    return [
      {
        source: '/(.*?)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
  turbopack: {
    resolveAlias: {
      // Workaround for canvaskit
      fs: {
        browser: './src/emptyModule.ts',
      },
      // Workaround to avoid turbopack generating files with colons,
      // which are not supported on an NTFS filesystem (Windows). 
      // https://github.com/vercel/next.js/discussions/86194
      'node:inspector': 'inspector',
  }
}
};

module.exports = nextConfig;

// Injected content via Sentry wizard below

const { withSentryConfig } = require('@sentry/nextjs/config');

module.exports = withSentryConfig(module.exports, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'sentry',
  project: 'pytamaro',
  sentryUrl: 'https://sentry.luce.si.usi.ch/',

  // Only print logs for uploading source maps in CI
  silent: Boolean(process.env.CI),

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  // (`disableLogger` was removed in @sentry/nextjs v11; this option works with
  // both webpack and Turbopack)
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
  },

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});
