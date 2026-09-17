import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@veylix/ui", "@veylix/types", "@veylix/validation"],
  poweredByHeader: false,
};

export default nextConfig;
