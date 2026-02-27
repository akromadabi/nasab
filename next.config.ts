import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    remotePatterns: [],
    unoptimized: true,
  },

  // Server external packages (for Prisma)
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-mariadb", "mariadb"],

  // Strict mode for React
  reactStrictMode: true,

  // Hide dev indicator
  devIndicators: false,

  // Output configuration for deployment
  output: "standalone",

  // Force include Prisma generated files (WASM query compiler) in standalone
  outputFileTracingIncludes: {
    "/**": ["./src/generated/prisma/**/*", "./node_modules/.prisma/**/*"],
  },

  // Exclude Windows-specific native binaries (crash on Linux)
  outputFileTracingExcludes: {
    "/**": [
      "./node_modules/@img/sharp-win32-x64/**",
      "./node_modules/@img/sharp-win32-ia32/**",
      "./node_modules/sharp/**",
    ],
  },

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
