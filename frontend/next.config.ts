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
        port: '5000',
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
  serverExternalPackages: ['pdfjs-dist'],
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Disable filesystem caching to prevent OneDrive file lock/ENOENT issues
      config.cache = false;
    }

    // Fix react-pdf: avoid eval-based devtool which breaks pdfjs-dist ESM
    if (dev && !isServer) {
      config.devtool = 'source-map';
    }

    // Aliases to prevent Node.js-only modules from being bundled client-side
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;

    return config;
  },
};

export default nextConfig;
