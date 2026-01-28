import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Só carrega os módulos usados desses pacotes → compila mais rápido
  experimental: {
    optimizePackageImports: [
      '@base-ui/react',
      'motion',
      '@heroicons/react',
      'lucide-react',
    ],
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
