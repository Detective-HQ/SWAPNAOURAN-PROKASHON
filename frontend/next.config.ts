import type { NextConfig } from 'next';

const rawBackendUrl =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000';
const backendUrl = rawBackendUrl.replace(/\/$/, '').replace(/\/api$/, '');

const nextConfig: NextConfig = {
  distDir: ".next",
  outputFileTracingRoot: __dirname,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return {
      afterFiles: [
        {
          source: '/backend-api/:path*',
          destination: `${backendUrl}/api/:path*`,
        },
        {
          source: '/api/:path*',
          destination: `${backendUrl}/api/:path*`,
        },
      ],
    };
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable filesystem caching to prevent OneDrive file lock/ENOENT issues
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
