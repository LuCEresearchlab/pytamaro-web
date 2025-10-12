const { i18n } = require('./next-i18next.config');
const CopyWebpackPlugin = require("copy-webpack-plugin");

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
  webpack(config, { isServer, dev }) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    config.resolve.fallback = {
      fs: false,
      path: false,
      os: false,
    };

    if (!dev && isServer) {
      config.output.webassemblyModuleFilename = 'chunks/[id].wasm';
      config.plugins.push(new WasmChunksFixPlugin());
    }

    return config;
  },
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
  i18n,
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
  async headers() {
    return [
      {
        source: '/(.*)',
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
      }
  }
}
};

module.exports = nextConfig;

// Workaround from https://github.com/vercel/next.js/issues/29362#issuecomment-971377869
class WasmChunksFixPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap('WasmChunksFixPlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        { name: 'WasmChunksFixPlugin' },
        (assets) =>
          Object.entries(assets).forEach(([pathname, source]) => {
            if (!pathname.match(/\.wasm$/)) return;
            compilation.deleteAsset(pathname);

            const name = pathname.split('/')[1];
            const info = compilation.assetsInfo.get(pathname);
            compilation.emitAsset(name, source, info);
          }),
      );
    });
  }
}

// Injected content via Sentry wizard below

const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(module.exports, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'sentry',
  project: 'pytamaro',
  sentryUrl: 'https://sentry.luce.si.usi.ch/',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

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
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});
