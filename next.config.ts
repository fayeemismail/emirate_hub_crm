import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow HMR when opening the LAN Network URL (e.g. phone / another device).
  allowedDevOrigins: ['192.168.220.52'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
