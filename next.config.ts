import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/aquavitaeum",
  assetPrefix: "/aquavitaeum",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
