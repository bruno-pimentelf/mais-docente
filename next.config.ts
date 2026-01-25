import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias['konva$'] = require.resolve('konva/lib/index.js');
    return config;
  },
  turbopack: {
    resolveAlias: {
      'konva$': require.resolve('konva/lib/index.js'),
    },
  },
};

export default nextConfig;
