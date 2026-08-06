import type { NextConfig } from "next";

// GitHub Pages deployment requires static export with basePath.
// These settings must NOT apply during local dev (npm run dev),
// otherwise routes break due to the /aquavitaeum prefix.
const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  ...(isProduction && {
    output: "export",
    basePath: "/aquavitaeum",
    assetPrefix: "/aquavitaeum",
  }),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
