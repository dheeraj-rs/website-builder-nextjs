import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Critical: WebContainer requires these security headers
  async headers() {
    return [
      {
        source: '/:path*',
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

  // Webpack configuration for node polyfills
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: require.resolve('path-browserify'),
        buffer: require.resolve('buffer/'),
      };
    }
    return config;
  },
};

export default nextConfig;
