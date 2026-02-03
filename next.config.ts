import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "testprepsheets.com" }],
        destination: "https://www.testprepsheets.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
