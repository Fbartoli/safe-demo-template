import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { dev, isServer }) => {
    if (dev && isServer) {
      // Only load pino-pretty in development on the server side
      require('pino-pretty')
    }
    return config
  },
  /* config options here */
};

export default nextConfig;
