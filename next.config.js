// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
const { withSentryConfig } = require('@sentry/nextjs');
const { i18n } = require('./next-i18next.config')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  staticPageGenerationTimeout: 300,
  env: {
    PLATFORM_VERSION: require('child_process').execSync('git rev-parse --short HEAD').toString().trim(),
    BUILD_TIMESTAMP: Date.now().toString(),
  },
  webpack(config, { isServer, dev }) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    if (!dev && isServer) {
      config.output.webassemblyModuleFilename = "chunks/[id].wasm";
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
  experimental: {
    outputFileTracingIncludes: {
      '**': ['./**/*.wasm'],
    },
  },
  i18n,
}

module.exports = nextConfig

module.exports = withSentryConfig(
  module.exports,
  { silent: true, errorHandler: (err) => { console.warn(err); } },
  { hideSourceMaps: true },
);

// Workaround from https://github.com/vercel/next.js/issues/29362#issuecomment-971377869
class WasmChunksFixPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap("WasmChunksFixPlugin", (compilation) => {
      compilation.hooks.processAssets.tap(
        { name: "WasmChunksFixPlugin" },
        (assets) =>
          Object.entries(assets).forEach(([pathname, source]) => {
            if (!pathname.match(/\.wasm$/)) return;
            compilation.deleteAsset(pathname);

            const name = pathname.split("/")[1];
            const info = compilation.assetsInfo.get(pathname);
            compilation.emitAsset(name, source, info);
          })
      );
    });
  }
}
