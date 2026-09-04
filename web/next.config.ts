import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* The programme page moved to /programme and sign-in lives under /auth.
     Redirect the old paths so any existing link or bookmark still lands. */
  async redirects() {
    return [
      { source: '/program', destination: '/programme', permanent: true },
      { source: '/login', destination: '/auth/login', permanent: true },
    ]
  },

  /* config options here */
};

export default nextConfig;
