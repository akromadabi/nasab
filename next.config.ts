import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    remotePatterns: [],
    unoptimized: true,
  },

  // Server external packages (for Prisma)
  serverExternalPackages: ["@prisma/client", "pg"],

  // Strict mode for React
  reactStrictMode: true,

  // Hide dev indicator
  devIndicators: false,

  // Output configuration for deployment
  output: "standalone",

  // Headers for security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
