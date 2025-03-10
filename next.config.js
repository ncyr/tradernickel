/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable proper transpilation
  transpilePackages: [],
  // Remove swcMinify as it's now enabled by default
  typescript: {
    // Enable type checking in production builds
    ignoreBuildErrors: false
  },
  // Configure webpack for frontend optimization
  webpack: (config, { dev, isServer }) => {
    // Add module resolution fallbacks for browser environment
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      pg: false,
      'pg-native': false,
      'pg-pool': false,
      'pg-protocol': false,
    };

    // Optimize chunk loading
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 90000,
          cacheGroups: {
            default: false,
            vendors: false,
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },
  // async redirects() {
  //   return [
  //     {
  //       source: '/dashboard',
  //       destination: '/login',
  //       permanent: false,
  //     },
  //   ];
  // },
  // Increase buffer size for large chunks
  experimental: {
    largePageDataBytes: 128 * 1000, // 128KB
  },
  // Configure compression
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
}

module.exports = nextConfig 