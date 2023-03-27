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
