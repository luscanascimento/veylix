import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  transpilePackages: ["@veylix/ui", "@veylix/types", "@veylix/validation"],
  poweredByHeader: false,
};

export default nextConfig;
