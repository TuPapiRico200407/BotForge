/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@botforge/ui", "@botforge/core", "@botforge/infrastructure"],
};

module.exports = nextConfig;
